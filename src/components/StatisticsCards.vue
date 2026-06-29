<template>
  <div class="statistics-cards" :class="{ 'gray-mode': isGray }">
    <div class="stat-card">
      <div class="stat-card-row">
        <span class="stat-label">Сотрудников</span>
      </div>
      <div class="stat-card-row stat-value-row">
        <span class="stat-number">{{ stats.totalEmployees }}</span>
      </div>
      <div class="stat-card-row stat-unit-row">
        <span class="stat-unit">в команде</span>
      </div>
    </div>

    <div class="stat-card stat-card-red">
      <div class="stat-card-row">
        <span class="stat-label">Перегружены</span>
      </div>
      <div class="stat-card-row stat-value-row">
        <span class="stat-number">{{ stats.overloadCount }}</span>
      </div>
      <div class="stat-card-row stat-unit-row">
        <span class="stat-unit">требуют внимания</span>
      </div>
    </div>

    <div class="stat-card stat-card-green">
      <div class="stat-card-row">
        <span class="stat-label">Свободны</span>
      </div>
      <div class="stat-card-row stat-value-row">
        <span class="stat-number">{{ stats.freeCount }}</span>
      </div>
      <div class="stat-card-row stat-unit-row">
        <span class="stat-unit">требуют внимания</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card-row">
        <span class="stat-label">Задач</span>
      </div>
      <div class="stat-card-row stat-value-row">
        <span class="stat-number">{{ stats.totalTasks }}</span>
      </div>
      <div class="stat-card-row stat-unit-row">
        <span class="stat-unit">всего</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card-row">
        <span class="stat-label">{{ isGray ? 'Без времени' : 'Задач закрыто' }}</span>
      </div>
      <div class="stat-card-row stat-value-row">
        <span class="stat-number">{{ isGray ? noTimeCount : stats.completedPercent + '%' }}</span>
      </div>
      <div class="stat-card-row stat-unit-row">
        <span class="stat-unit">{{ isGray ? 'не хватает данных' : periodLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true },
  periodLabel: { type: String, default: 'на сегодня' },
  isGray: { type: Boolean, default: false },
  noTimeCount: { type: Number, default: 0 }
})
</script>

<style scoped>
.statistics-cards { display: flex; gap: 2.1%; width: 100%; flex-wrap: wrap; }
.stat-card { display: flex; flex-direction: column; padding: 14px 1% 16px; gap: 6px; background: #F5F4ED; border-radius: 10px; flex: 1; min-width: 120px; }
.stat-card-red { background: #FAECE7; }
.stat-card-green { background: #EAF3DE; }
.stat-card-row { display: flex; align-items: center; width: 100%; }
.stat-value-row, .stat-unit-row { justify-content: flex-start; }
.stat-label { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 20px; color: #000000; }
.stat-number { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 40px; margin-top: 2px; color: #000000; }
.stat-card-red .stat-number { color: #E24B4A; }
.stat-card-green .stat-number { color: #416517; }
.stat-unit { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: #000000; }

.gray-mode .stat-card { background: #E8E8E8 !important; }
.gray-mode .stat-card-red, .gray-mode .stat-card-green { background: #E8E8E8 !important; }
.gray-mode .stat-number { color: #888888 !important; }
.gray-mode .stat-card-red .stat-number, .gray-mode .stat-card-green .stat-number { color: #888888 !important; }
.gray-mode .stat-label, .gray-mode .stat-unit { color: #888888 !important; }

@media (max-width: 992px) {
  .statistics-cards { gap: 12px; }
  .stat-card { min-width: calc(50% - 6px); flex: 0 0 calc(50% - 6px); }
  .stat-number { font-size: 32px; }
  .stat-label { font-size: 16px; }
}
@media (max-width: 480px) {
  .stat-card { min-width: 100%; flex: 0 0 100%; padding: 12px 16px; }
  .stat-number { font-size: 28px; }
}
</style>