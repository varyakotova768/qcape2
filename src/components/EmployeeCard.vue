<template>
  <div class="employee-card">
    <div class="employee-main">
      <div class="employee-info">
        <div class="employee-avatar" :style="avatarStyle"></div>
        <div class="employee-details">
          <div class="employee-name">{{ employee.name }}</div>
          <div class="employee-position">{{ employee.position }}</div>
        </div>
      </div>
      <div class="employee-tasks">
        <TaskBadge v-for="task in activeTasks" :key="task.id" :task="task" />
        <div v-if="!activeTasks.length" class="no-tasks">Нет активных задач</div>
      </div>
    </div>
    <div class="employee-sidebar">
      <div class="workload-indicator" :class="workloadClass">
        <span class="workload-label">{{ workloadLabel }}</span>
        <strong class="workload-hours">
          {{ plannedHours }}{{ capacity === 0 ? '' : '/' + capacity }}
        </strong>
      </div>
      <BitrixLink @click="$emit('openBitrix')" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TaskBadge from './TaskBadge.vue'
import BitrixLink from './BitrixLink.vue'

const props = defineProps({
  employee: { type: Object, required: true },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
  timeFilter: { type: String, default: 'all' }
})

defineEmits(['openBitrix'])

// --- Вспомогательные функции ---

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
    if (task.timeSpent > 0) return task.timeSpent
    if (task.timeEstimate > 0) return task.timeEstimate
    return 0
  } else {
    return task.timeEstimate > 0 ? task.timeEstimate : 0
  }
}

function isTaskIncomplete(task) {
  const hasStart = !!(task.plannedStart || task.createdDate)
  let hasEnd = false
  if (task.status === 'completed') {
    hasEnd = !!(task.closedDate || task.plannedEnd || task.deadline)
  } else {
    hasEnd = !!(task.plannedEnd || task.deadline)
  }
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
    if (current.getDay() !== 0 && current.getDay() !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

function isTaskInPeriod(task, from, to) {
  if (!from || !to) return true
  const rangeStart = new Date(from)
  const rangeEnd = new Date(to)
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(23, 59, 59, 999)

  const interval = getTaskInterval(task)
  if (!interval) return false

  let effectiveStart = interval.start
  let effectiveEnd = interval.end

  if (task.status !== 'completed') {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (interval.end < now) {
      effectiveEnd = now
    }
  }

  return isOverlapping(effectiveStart, effectiveEnd, rangeStart, rangeEnd)
}

// --- Вычисляемые свойства ---

const isAllWeekend = computed(() => {
  if (!props.dateFrom || !props.dateTo) return false
  return getWorkingDaysCount(props.dateFrom, props.dateTo) === 0
})

const capacity = computed(() => {
  if (!props.dateFrom || !props.dateTo) return 0
  return getWorkingDaysCount(props.dateFrom, props.dateTo) * 8
})

const activeTasks = computed(() => {
  if (props.timeFilter === 'incomplete') {
    return (props.employee.tasks || []).filter(task => isTaskIncomplete(task))
  }

  if (!props.dateFrom || !props.dateTo) return []
  const rangeStart = new Date(props.dateFrom)
  const rangeEnd = new Date(props.dateTo)
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(23, 59, 59, 999)

  return (props.employee.tasks || []).filter(task => {
    // Исключаем задачи, у которых нет времени (ни затраченного, ни планового)
    if (getTaskTime(task) === 0) {
      return false
    }
    if (!isTaskInPeriod(task, props.dateFrom, props.dateTo)) return false
    return true
  })
})

const plannedHours = computed(() => {
  let totalSeconds = 0
  const tasksForLoad = (props.employee.tasks || []).filter(task => {
    if (props.timeFilter === 'incomplete') return false
    if (getTaskTime(task) === 0) return false // нет времени – не учитываем
    return isTaskInPeriod(task, props.dateFrom, props.dateTo)
  })
  tasksForLoad.forEach(task => {
    const interval = getTaskInterval(task)
    if (!interval) return
    const time = getTaskTime(task)
    if (time === 0) return
    const rangeStart = new Date(props.dateFrom)
    const rangeEnd = new Date(props.dateTo)
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
      totalSeconds += time
      return
    }
    const overlapStart = new Date(Math.max(effectiveStart.getTime(), rangeStart.getTime()))
    const overlapEnd = new Date(Math.min(effectiveEnd.getTime(), rangeEnd.getTime()))
    if (overlapStart > overlapEnd) return
    const overlapDays = getWorkingDaysCount(overlapStart, overlapEnd)
    if (overlapDays === 0) return
    totalSeconds += time * (overlapDays / totalDays)
  })
  return Math.round((totalSeconds / 3600) * 10) / 10
})

const workloadClass = computed(() => {
  if (props.timeFilter === 'incomplete') return 'workload-weekend'
  if (isAllWeekend.value) return 'workload-weekend'
  if (plannedHours.value === 0) return 'workload-free'
  const loadPercent = plannedHours.value / capacity.value
  if (loadPercent > 1) return 'workload-overload'
  if (loadPercent >= 0.8) return 'workload-normal'
  return 'workload-free'
})

const workloadLabel = computed(() => {
  if (props.timeFilter === 'incomplete') return 'Без данных'
  if (isAllWeekend.value) return 'Выходной'
  return 'Запланировано'
})

const avatarStyle = computed(() => {
  if (props.employee.avatar) {
    return { backgroundImage: `url(${props.employee.avatar})` }
  }
  return {}
})
</script>

<style scoped>
.employee-card { display: flex; padding: 14px; gap: 8px; width: 100%; background: #FFFFFF; border: 1px solid #D5D4CE; border-radius: 10px; flex-wrap: wrap; }
.employee-main { display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 0; }
.employee-info { display: flex; align-items: center; gap: 12px; }
.employee-avatar { width: 52px; height: 52px; border-radius: 50%; background-size: cover; background-position: center; background-color: #ddd; flex-shrink: 0; }
.employee-details { display: flex; flex-direction: column; }
.employee-name { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 20px; color: #141413; }
.employee-position { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: #636363; }
.employee-tasks { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; }
.no-tasks { font-size: 14px; color: #999; }
.employee-sidebar { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
.workload-indicator { display: flex; align-items: center; padding: 6px 8px; gap: 8px; border-radius: 4px; font-family: 'Inter', sans-serif; }
.workload-label { font-size: 14px; font-weight: 400; }
.workload-hours { font-size: 20px; font-weight: 500; }
.workload-overload { background: #FAECE7; color: #E24B4A; }
.workload-free { background: #EAF3DE; color: #416517; }
.workload-normal { background: #EEEDFE; color: #3C3489; }
.workload-weekend { background: #E8E8E8; color: #888888; }

@media (max-width: 768px) {
  .employee-card { padding: 12px; }
  .employee-name { font-size: 17px; }
  .employee-avatar { width: 40px; height: 40px; }
  .employee-sidebar { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; }
  .workload-hours { font-size: 17px; }
}
@media (max-width: 480px) {
  .employee-card { padding: 10px; }
  .employee-info { gap: 8px; }
  .employee-avatar { width: 36px; height: 36px; }
  .employee-name { font-size: 15px; }
  .employee-position { font-size: 12px; }
  .workload-indicator { padding: 4px 6px; }
  .workload-label { font-size: 12px; }
  .workload-hours { font-size: 15px; }
}
</style>