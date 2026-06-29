<template>
  <div class="dashboard-header">
    <div class="header-title-block">
      <h1 class="header-title">Загруженность команды</h1>
    </div>
    <div class="header-sync-block">
      <span class="last-update">Последнее обновление: {{ formattedTime }}</span>
      <button class="sync-button" :disabled="isLoading" @click="$emit('sync')">
        <span class="sync-text">Синхронизировать</span>
        <svg 
          class="sync-icon" 
          :class="{ rotating: isLoading }"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M6.66667 10.6667H3.33333V14M9.33333 5.33333H12.6667V2M3.05534 6.00227C3.42913 5.07711 4.05496 4.27536 4.8617 3.68815C5.66844 3.10094 6.62457 2.75168 7.61984 2.68034C8.6151 2.609 9.60982 2.81827 10.4921 3.28441C11.3743 3.75055 12.1075 4.45503 12.6094 5.31742M12.945 9.99805C12.5712 10.9232 11.9454 11.725 11.1387 12.3122C10.3319 12.8994 9.37678 13.2482 8.38151 13.3195C7.38625 13.3909 6.39071 13.1816 5.50846 12.7155C4.62622 12.2494 3.89255 11.545 3.39063 10.6826" 
            stroke="#141413" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lastUpdate: { type: Date, default: () => new Date() },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['sync'])

const formattedTime = computed(() => {
  const d = props.lastUpdate
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 12px;
}

.header-title {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 36px;
  color: #000000;
  margin: 0;
}

.header-sync-block {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.last-update {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 18px;
  color: #141413;
}

.sync-button {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  gap: 10px;
  border: 1px solid #B6B6B5;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: 0.2s;
}

.sync-button:hover:not(:disabled) {
  background: #e9e8e0;
}

.sync-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sync-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 18px;
  color: #141413;
}

.sync-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
}

/* Анимация вращения */
.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 28px;
    line-height: 34px;
  }

  .last-update {
    font-size: 14px;
  }

  .sync-text {
    font-size: 14px;
  }

  .header-sync-block {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 22px;
  }

  .sync-button {
    padding: 4px 8px;
  }
}
</style>