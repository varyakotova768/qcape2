<template>
  <div class="app-wrapper">
    <div class="employees">
      <div class="main">
        <DashboardHeader 
          :lastUpdate="lastUpdate" 
          :isLoading="isLoading"
          @sync="handleSync" 
        />

        <StatisticsCards :stats="statistics" />

        <div class="dashboard-content">
          <div class="dashboard-left">
            <EmployeeFilters
              v-model:search="searchQuery"
              v-model:workloadFilter="workloadFilter"
              v-model:activeTab="activeTab"
              v-model:taskSearch="taskSearch"
              v-model:period="selectedPeriod"
              :isLoading="isLoading"
            />
            
            <EmployeeList
              v-if="activeTab === 'employees'"
              :employees="filteredEmployees"
              :isLoading="isLoading"
              :period="selectedPeriod"
              @openBitrix="openBitrix"
            />
          </div>
          
          <StatisticsSidebar 
            :distribution="distributionData" 
            :taskStatuses="taskStatusList" 
            :isLoading="isLoading"
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
import StatisticsSidebar from './components/StatisticsSidebar.vue'
import { bitrixService } from './services/bitrix.js'

const isLoading = ref(false)
const employees = ref([])
const searchQuery = ref('')
const workloadFilter = ref('all')
const taskSearch = ref('')
const activeTab = ref('employees')
const selectedPeriod = ref('today')
const lastUpdate = ref(new Date())

const loadData = async () => {
  isLoading.value = true
  try {
    const users = await bitrixService.fetchUsers()
    employees.value = users
    lastUpdate.value = new Date()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    employees.value = bitrixService.getMockUsers()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

const statistics = computed(() => {
  const allTasks = employees.value.flatMap(e => e.tasks || [])
  const completedTasks = allTasks.filter(t => t.status === 'completed').length
  return {
    totalEmployees: employees.value.length,
    overloadCount: employees.value.filter(e => e.loadStatus === 'overload').length,
    freeCount: employees.value.filter(e => e.loadStatus === 'free').length,
    normalCount: employees.value.filter(e => e.loadStatus === 'normal').length,
    totalTasks: allTasks.filter(t => t.status !== 'completed').length,
    completedPercent: allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0
  }
})

const distributionData = computed(() => ({
  overload: statistics.value.overloadCount,
  normal: statistics.value.normalCount,
  free: statistics.value.freeCount
}))

const taskStatusList = computed(() => {
  const tasks = employees.value.flatMap(e => e.tasks || [])
  return [
    { type: 'inProgress', label: 'Выполняется', count: tasks.filter(t => t.status === 'inProgress').length, color: 'blue' },
    { type: 'waiting', label: 'Ждет контроля', count: tasks.filter(t => t.status === 'waiting').length, color: 'red' },
    { type: 'pending', label: 'Ожидает выполнения', count: tasks.filter(t => t.status === 'pending').length, color: 'orange' },
    { type: 'completed', label: 'Завершена', count: tasks.filter(t => t.status === 'completed').length, color: 'green' }
  ]
})

const filteredEmployees = computed(() => {
  let filtered = employees.value
  if (workloadFilter.value !== 'all') {
    filtered = filtered.filter(e => e.loadStatus === workloadFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(q) || 
      (e.position && e.position.toLowerCase().includes(q))
    )
  }
  return filtered
})

const handleSync = () => {
  loadData()
}

const openBitrix = (id) => {
  const url = `https://b24-pnmyg5.bitrix24.ru/company/personal/user/${id}/`
  window.open(url, '_blank')
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
  .app-wrapper {
    padding: 0 10px;
  }
  
  .main {
    padding: 20px 24px;
    gap: 24px;
  }
  
  .dashboard-content {
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .dashboard-content {
    flex-direction: column;
  }
  
  .dashboard-left {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main {
    padding: 16px;
    gap: 16px;
  }
}
</style>