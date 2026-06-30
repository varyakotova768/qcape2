<template>
  <div class="task-list">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Загрузка задач...</span>
    </div>

    <TaskCard v-else
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :employees="employees"
      @openBitrix="$emit('openBitrix', task.id)"
    />

    <div v-if="!isLoading && tasks.length === 0" class="empty-state">
      Задачи не найдены
    </div>
  </div>
</template>

<script setup>
import TaskCard from './TaskCard.vue'

defineProps({
  tasks: { type: Array, required: true },
  employees: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['openBitrix'])
</script>

<style scoped>
.task-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #FFFFFF; border: 1px solid #d5d4ce; border-radius: 10px; gap: 12px; color: #666; }
.loading-spinner { width: 32px; height: 32px; border: 3px solid #ddd; border-top-color: #636363; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; background: #FFFFFF; border: 1px solid #d5d4ce; border-radius: 10px; color: #666; }
</style>