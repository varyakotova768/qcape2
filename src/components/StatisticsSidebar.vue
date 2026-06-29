<template>
  <div class="statistics-sidebar" :class="{ 'gray-mode': isGray }">
    <div v-if="isLoading" class="loading-placeholder">
      <div class="loading-spinner"></div>
      <span>Загрузка статистики...</span>
    </div>

    <template v-else>
      <div class="distribution-block">
        <h3 class="sidebar-title">Распределение по команде</h3>

        <div class="pie-chart">
          <svg width="180" height="180" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#F5F4ED" stroke-width="6" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#E24B4A" stroke-width="6"
              :stroke-dasharray="overloadDasharray" stroke-dashoffset="0" transform="rotate(-90 20 20)" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#3C3489" stroke-width="6"
              :stroke-dasharray="normalDasharray" :stroke-dashoffset="normalDashoffset" transform="rotate(-90 20 20)" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#416517" stroke-width="6"
              :stroke-dasharray="freeDasharray" :stroke-dashoffset="freeDashoffset" transform="rotate(-90 20 20)" />
            <circle cx="20" cy="20" r="11" fill="white" />
          </svg>
        </div>

        <div class="distribution-legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #E24B4A"></div>
            <span class="legend-text">Перегружены — {{ distribution.overload }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #3C3489"></div>
            <span class="legend-text">Норма — {{ distribution.normal }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #416517"></div>
            <span class="legend-text">Свободны — {{ distribution.free }}</span>
          </div>
        </div>
      </div>

      <hr class="sidebar-divider" />

      <div class="task-status-block">
        <h3 class="sidebar-title">Статусы задач</h3>
        <div class="task-status-list">
          <StatusBadge v-for="status in taskStatuses" :key="status.type" :status="status" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import { computed } from 'vue'

const props = defineProps({
  distribution: { type: Object, required: true },
  taskStatuses: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  isGray: { type: Boolean, default: false }
})

const totalEmployees = computed(() => {
  return props.distribution.overload + props.distribution.normal + props.distribution.free
})

const CIRCUMFERENCE = 100.53

const overloadDasharray = computed(() => {
  if (totalEmployees.value === 0) return '0 100.53'
  const percent = props.distribution.overload / totalEmployees.value
  const length = CIRCUMFERENCE * percent
  return `${length} ${CIRCUMFERENCE}`
})
const normalDasharray = computed(() => {
  if (totalEmployees.value === 0) return '0 100.53'
  const percent = props.distribution.normal / totalEmployees.value
  const length = CIRCUMFERENCE * percent
  return `${length} ${CIRCUMFERENCE}`
})
const freeDasharray = computed(() => {
  if (totalEmployees.value === 0) return '0 100.53'
  const percent = props.distribution.free / totalEmployees.value
  const length = CIRCUMFERENCE * percent
  return `${length} ${CIRCUMFERENCE}`
})
const normalDashoffset = computed(() => {
  if (totalEmployees.value === 0) return 0
  const overloadPercent = props.distribution.overload / totalEmployees.value
  return -(CIRCUMFERENCE * overloadPercent)
})
const freeDashoffset = computed(() => {
  if (totalEmployees.value === 0) return 0
  const overloadPercent = props.distribution.overload / totalEmployees.value
  const normalPercent = props.distribution.normal / totalEmployees.value
  return -(CIRCUMFERENCE * (overloadPercent + normalPercent))
})
</script>

<style scoped>
.statistics-sidebar { display: flex; flex-direction: column; padding: 14px; gap: 20px; width: 32%; flex-shrink: 0; background: #FFFFFF; border: 1px solid #D5D4CE; border-radius: 10px; }
.loading-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 12px; color: #666; min-height: 300px; }
.loading-spinner { width: 32px; height: 32px; border: 3px solid #ddd; border-top-color: #636363; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.distribution-block { display: flex; flex-direction: column; gap: 15px; width: 100%; }
.sidebar-title { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 20px; color: #141413; margin: 0; }
.pie-chart { display: flex; justify-content: center; margin: 10px 0; }
.distribution-legend { display: flex; flex-direction: column; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 8px; }
.legend-text { font-family: 'Inter', sans-serif; font-size: 16px; color: #000000; }
.legend-color { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
.sidebar-divider { width: 100%; border: 1px solid #D5D4CE; }
.task-status-block { width: 100%; }
.task-status-list { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }

.gray-mode .statistics-sidebar { background: #F5F4ED; border-color: #B6B6B5; }
.gray-mode .sidebar-title { color: #888888; }
.gray-mode .legend-text { color: #888888; }
.gray-mode .pie-chart circle { stroke-opacity: 0.3; }
.gray-mode .pie-chart circle[stroke="#E24B4A"] { stroke: #888888; }
.gray-mode .pie-chart circle[stroke="#3C3489"] { stroke: #888888; }
.gray-mode .pie-chart circle[stroke="#416517"] { stroke: #888888; }
.gray-mode .sidebar-divider { border-color: #B6B6B5; }

@media (max-width: 1200px) { .statistics-sidebar { width: 35%; } }
@media (max-width: 992px) {
  .statistics-sidebar { width: 100%; padding: 16px; }
  .pie-chart svg { width: 140px; height: 140px; }
}
@media (max-width: 768px) {
  .statistics-sidebar { padding: 12px; gap: 16px; }
  .sidebar-title { font-size: 18px; }
  .legend-text { font-size: 14px; }
  .pie-chart svg { width: 120px; height: 120px; }
}
@media (max-width: 480px) {
  .statistics-sidebar { padding: 10px; gap: 12px; }
  .pie-chart svg { width: 100px; height: 100px; }
  .sidebar-title { font-size: 16px; }
  .legend-text { font-size: 13px; }
}
</style>