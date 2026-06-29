<template>
  <div class="app-wrapper">
    <div class="employees">
      <div class="main">
        <DashboardHeader :lastUpdate="lastUpdate" :isLoading="isLoading" @sync="handleSync" />
        <StatisticsCards
          :stats="statistics"
          :periodLabel="periodLabel"
          :isGray="isTimeFilterActive"
          :noTimeCount="allNoTimeCount"
        />
        <div class="dashboard-content">
          <div class="dashboard-left">
            <EmployeeFilters
              v-model:search="searchQuery"
              v-model:workloadFilter="workloadFilter"
              v-model:activeTab="activeTab"
              v-model:taskSearch="taskSearch"
              v-model:taskStatusFilter="taskStatusFilter"
              v-model:dateFrom="dateFrom"
              v-model:dateTo="dateTo"
              v-model:timeFilter="timeFilter"
              :isLoading="isLoading"
              :noTimeCount="allNoTimeCount"
            />
            <EmployeeList
              v-if="activeTab === 'employees'"
              :employees="filteredEmployees"
              :isLoading="isLoading"
              :dateFrom="dateFrom"
              :dateTo="dateTo"
              :timeFilter="timeFilter"
              @openBitrix="openBitrix"
            />
            <TaskList
              v-else-if="activeTab === 'tasks'"
              :tasks="filteredTasks"
              :employees="employees"
              :dateFrom="dateFrom"
              :dateTo="dateTo"
              :timeFilter="timeFilter"
              :isLoading="isLoading"
              @openBitrix="openTaskInBitrix"
            />
          </div>
          <StatisticsSidebar
            :distribution="distributionData"
            :taskStatuses="taskStatusList"
            :isLoading="isLoading"
            :isGray="isTimeFilterActive"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardHeader from './components/DashboardHeader.vue'
import StatisticsCards from './components/StatisticsCards.vue'
import EmployeeFilters from './components/EmployeeFilters.vue'
import EmployeeList from './components/EmployeeList.vue'
import TaskList from './components/TaskList.vue'
import StatisticsSidebar from './components/StatisticsSidebar.vue'
import { bitrixService } from './services/bitrix.js'

const isLoading = ref(false)
const employees = ref([])
const tasks = ref([])
const searchQuery = ref('')
const workloadFilter = ref('all')
const taskSearch = ref('')
const taskStatusFilter = ref('all')
const activeTab = ref('employees')
const lastUpdate = ref(new Date())
const dateFrom = ref('')
const dateTo = ref('')
const timeFilter = ref('all') // 'all' | 'incomplete'

// --- Вспомогательные функции для дат ---

function isOverlapping(taskStart, taskEnd, rangeStart, rangeEnd) {
  const start = taskStart || new Date(0)
  const end = taskEnd || new Date(8640000000000000)
  return start <= rangeEnd && end >= rangeStart
}

function getTaskInterval(task) {
  let start = task.plannedStart ? new Date(task.plannedStart) : null
  if (!start && task.createdDate) start = new Date(task.createdDate)
  if (!start) return null

  let end = null
  if (task.status === 'completed') {
    if (task.closedDate) end = new Date(task.closedDate)
    else if (task.plannedEnd) end = new Date(task.plannedEnd)
    else if (task.deadline) end = new Date(task.deadline)
    else return null
  } else {
    if (task.plannedEnd) end = new Date(task.plannedEnd)
    else if (task.deadline) end = new Date(task.deadline)
    else end = new Date()
  }
  return { start, end }
}

function getTaskTime(task) {
  if (task.status === 'completed') {
    // Для завершённых: сначала фактическое время, потом плановое
    if (task.timeSpent > 0) return task.timeSpent
    if (task.timeEstimate > 0) return task.timeEstimate
    return 0
  } else {
    // Для незавершённых: только плановое время
    return task.timeEstimate > 0 ? task.timeEstimate : 0
  }
}

function isTaskIncomplete(task) {
  // Проверяем наличие начала
  const hasStart = !!(task.plannedStart || task.createdDate)
  // Проверяем наличие конца
  let hasEnd = false
  if (task.status === 'completed') {
    hasEnd = !!(task.closedDate || task.plannedEnd || task.deadline)
  } else {
    hasEnd = !!(task.plannedEnd || task.deadline)
  }
  // Проверяем наличие времени (только timeEstimate для незавершённых)
  const time = getTaskTime(task)
  const hasTime = time > 0

  return !hasStart || !hasEnd || !hasTime
}

function getWorkingDaysCount(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

function isTaskInPeriod(task, from, to) {
  if (!from || !to) return true
  const rangeStart = new Date(from)
  const rangeEnd = new Date(to)
  // Не обнуляем время у rangeStart и rangeEnd – они уже приходят с полным временем из дата-пикеров

  const interval = getTaskInterval(task)
  if (!interval) return false

  let effectiveStart = interval.start
  let effectiveEnd = interval.end

  // Для незавершённых задач проверяем просрочку с учётом времени
  if (task.status !== 'completed') {
    const now = new Date()
    if (effectiveEnd < now) {
      effectiveEnd = now
    }
  }

  return isOverlapping(effectiveStart, effectiveEnd, rangeStart, rangeEnd)
}

function computeEmployeeLoad(employee, from, to) {
  const tasksInPeriod = (employee.tasks || []).filter(task => {
    // Для незавершённых задач должно быть плановое время > 0
    if (task.status !== 'completed' && task.timeEstimate === 0) {
      return false
    }
    return isTaskInPeriod(task, from, to) && getTaskTime(task) > 0
  })

  const capacity = getWorkingDaysCount(from, to) * 8
  let plannedSeconds = 0
  tasksInPeriod.forEach(task => {
    const interval = getTaskInterval(task)
    if (!interval) return
    const time = getTaskTime(task)
    if (time === 0) return
    const rangeStart = new Date(from)
    const rangeEnd = new Date(to)
    rangeStart.setHours(0, 0, 0, 0)
    rangeEnd.setHours(23, 59, 59, 999)

    let effectiveStart = interval.start
    let effectiveEnd = interval.end
    if (task.status !== 'completed') {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      if (interval.end < now) {
        effectiveEnd = now
      }
    }

    const totalDays = getWorkingDaysCount(effectiveStart, effectiveEnd)
    if (totalDays === 0) {
      plannedSeconds += time
      return
    }
    const overlapStart = new Date(Math.max(effectiveStart.getTime(), rangeStart.getTime()))
    const overlapEnd = new Date(Math.min(effectiveEnd.getTime(), rangeEnd.getTime()))
    if (overlapStart > overlapEnd) return
    const overlapDays = getWorkingDaysCount(overlapStart, overlapEnd)
    if (overlapDays === 0) return
    const ratio = overlapDays / totalDays
    plannedSeconds += time * ratio
  })

  const plannedHours = Math.round((plannedSeconds / 3600) * 10) / 10

  let loadStatus
  if (capacity === 0) {
    loadStatus = 'weekend'
  } else if (plannedHours === 0) {
    loadStatus = 'free'
  } else {
    const loadPercent = plannedHours / capacity
    if (loadPercent > 1) loadStatus = 'overload'
    else if (loadPercent >= 0.8) loadStatus = 'normal'
    else loadStatus = 'free'
  }
  return { plannedHours, capacity, loadStatus, tasksInPeriod }
}

function enrichEmployeesWithLoad(employees, from, to) {
  return employees.map(emp => {
    const { plannedHours, capacity, loadStatus, tasksInPeriod } = computeEmployeeLoad(emp, from, to)
    return {
      ...emp,
      plannedHours,
      capacity,
      loadStatus,
      tasksInPeriod
    }
  })
}

// --- Загрузка данных ---

const enrichEmployeesWithTasks = (users, allTasks) => {
  return users.map(user => ({
    ...user,
    tasks: allTasks.filter(task => task.responsibleId === user.id)
  }))
}

const loadData = async () => {
  isLoading.value = true
  try {
    const data = await bitrixService.fetchAllData()
    tasks.value = data.tasks
    employees.value = enrichEmployeesWithTasks(data.users, data.tasks)
    lastUpdate.value = new Date()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    alert('Не удалось загрузить данные. Проверьте подключение к Битрикс24 и корректность вебхука.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)

// --- Данные для статистики (только по датам) ---

const tasksByDate = computed(() => {
  if (!dateFrom.value || !dateTo.value) return tasks.value
  return tasks.value.filter(task => isTaskInPeriod(task, dateFrom.value, dateTo.value))
})

const employeesByDate = computed(() => {
  return enrichEmployeesWithLoad(employees.value, dateFrom.value, dateTo.value)
})

// --- Фильтр "Без времени" ---

const isTimeFilterActive = computed(() => timeFilter.value === 'incomplete')

// Общее количество задач без времени (не зависит от дат)
const allNoTimeCount = computed(() => {
  return tasks.value.filter(task => isTaskIncomplete(task)).length
})

const filteredEmployees = computed(() => {
  if (isTimeFilterActive.value) {
    // Показываем только тех сотрудников, у которых есть хотя бы одна неполная задача
    return employees.value.filter(emp => {
      return (emp.tasks || []).some(task => isTaskIncomplete(task))
    })
  }
  let filtered = employeesByDate.value
  if (workloadFilter.value !== 'all') {
    filtered = filtered.filter(e => e.loadStatus === workloadFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(e => {
      const name = e.name.toLowerCase()
      const position = e.position ? e.position.toLowerCase() : ''
      return name.includes(q) || position.includes(q)
    })
  }
  return filtered
})

const filteredTasks = computed(() => {
  if (isTimeFilterActive.value) {
    // Показываем все неполные задачи (без учёта дат), но с учётом поиска и статусов
    let result = tasks.value.filter(task => isTaskIncomplete(task))
    if (taskStatusFilter.value !== 'all') {
      result = result.filter(t => t.status === taskStatusFilter.value)
    }
    if (taskSearch.value.trim()) {
      const q = taskSearch.value.toLowerCase().trim()
      result = result.filter(t => {
        const title = t.title.toLowerCase()
        const description = t.description ? t.description.toLowerCase() : ''
        const responsible = employees.value.find(e => e.id === t.responsibleId)
        const responsibleName = responsible ? responsible.name.toLowerCase() : ''
        return title.includes(q) ||
               description.includes(q) ||
               responsibleName.includes(q)
      })
    }
    return result
  }

  let filtered = tasksByDate.value
  // Добавляем проверку: для незавершённых задач должно быть плановое время > 0
  filtered = filtered.filter(task => {
    if (task.status !== 'completed' && task.timeEstimate === 0) {
      return false // незавершённые без планового времени не показываются
    }
    return true
  })
  
  if (taskStatusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === taskStatusFilter.value)
  }
  if (taskSearch.value.trim()) {
    const q = taskSearch.value.toLowerCase().trim()
    filtered = filtered.filter(t => {
      const title = t.title.toLowerCase()
      const description = t.description ? t.description.toLowerCase() : ''
      const responsible = employees.value.find(e => e.id === t.responsibleId)
      const responsibleName = responsible ? responsible.name.toLowerCase() : ''
      return title.includes(q) ||
             description.includes(q) ||
             responsibleName.includes(q)
    })
  }
  return filtered
})

// --- Статистика (на основе tasksByDate и employeesByDate) ---

const statistics = computed(() => {
  const allTasks = tasksByDate.value
  const completedTasks = allTasks.filter(t => t.status === 'completed').length
  const allEmployees = employeesByDate.value
  const overloadCount = allEmployees.filter(e => e.loadStatus === 'overload').length
  const freeCount = allEmployees.filter(e => e.loadStatus === 'free').length
  const normalCount = allEmployees.filter(e => e.loadStatus === 'normal').length
  const totalTasks = allTasks.length
  const completedPercent = allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0

  return {
    totalEmployees: allEmployees.length,
    overloadCount,
    freeCount,
    normalCount,
    totalTasks,
    completedPercent
  }
})

const distributionData = computed(() => ({
  overload: statistics.value.overloadCount,
  normal: statistics.value.normalCount,
  free: statistics.value.freeCount
}))

const taskStatusList = computed(() => {
  const allTasks = tasksByDate.value
  return [
    { type: 'inProgress', label: 'Выполняется', count: allTasks.filter(t => t.status === 'inProgress').length, color: 'blue' },
    { type: 'waiting', label: 'Ждет контроля', count: allTasks.filter(t => t.status === 'waiting').length, color: 'red' },
    { type: 'pending', label: 'Ожидает выполнения', count: allTasks.filter(t => t.status === 'pending').length, color: 'orange' },
    { type: 'completed', label: 'Завершена', count: allTasks.filter(t => t.status === 'completed').length, color: 'green' }
  ]
})

// --- Динамическая подпись для периода ---

const periodLabel = computed(() => {
  if (isTimeFilterActive.value) return 'без времени'
  if (!dateFrom.value || !dateTo.value) return 'за весь период'
  const from = new Date(dateFrom.value)
  const to = new Date(dateTo.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = from.getTime() === today.getTime() && to.getTime() === today.getTime()
  if (isToday) return 'сегодня'

  const diffDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1
  if (diffDays === 7) {
    const startDay = from.getDay()
    if (startDay === 1) return 'за неделю'
  }
  if (diffDays === 1) return 'за день'
  if (diffDays <= 31) return 'за месяц'
  return 'за период'
})

// --- Синхронизация ---

const handleSync = loadData

// --- Открытие в Битрикс24 ---

const portalUrl = bitrixService.getPortalUrl()

const openBitrix = (userId) => {
  if (!portalUrl) return
  window.open(`${portalUrl}/company/personal/user/${userId}/`, '_blank')
}

const openTaskInBitrix = (taskId) => {
  if (!portalUrl) return
  window.open(`${portalUrl}/company/personal/user/0/tasks/task/view/${taskId}/`, '_blank')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  background: #E6E4D8;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 0 20px;
}

.employees {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  max-width: 1440px;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 52px;
  gap: 34px;
  width: 100%;
  background: #F8F8F6;
  border-width: 0px 1px;
  border-style: solid;
  border-color: #D5D4CE;
  border-radius: 0;
  min-height: 100vh;
}

.dashboard-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 34px;
  width: 100%;
}

.dashboard-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 1200px) {
  .app-wrapper { padding: 0 10px; }
  .main { padding: 20px 24px; gap: 24px; }
  .dashboard-content { gap: 20px; }
}
@media (max-width: 992px) {
  .dashboard-content { flex-direction: column; }
  .dashboard-left { width: 100%; }
}
@media (max-width: 768px) {
  .main { padding: 16px; gap: 16px; }
}
</style>