<template>
  <div class="employee-list">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Загрузка сотрудников...</span>
    </div>
    
    <EmployeeCard
      v-else
      v-for="employee in employees"
      :key="employee.id"
      :employee="employee"
      :period="period"
      @openBitrix="$emit('openBitrix', employee.id)"
    />
    
    <div v-if="!isLoading && employees.length === 0" class="empty-state">
      Сотрудники не найдены
    </div>
  </div>
</template>

<script setup>
import EmployeeCard from './EmployeeCard.vue'

defineProps({
  employees: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  period: { type: String, default: 'today' }
})

defineEmits(['openBitrix'])
</script>

<style scoped>
.employee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #FFFFFF;
  border-radius: 10px;
  gap: 12px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #ddd;
  border-top-color: #3D3D3A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 40px;
  text-align: center;
  background: #FFFFFF;
  border-radius: 10px;
  color: #666;
}
</style>