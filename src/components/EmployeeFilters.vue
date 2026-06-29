<!-- src/components/EmployeeFilters.vue -->
<template>
  <div class="employee-filters">
    <div class="filter-tabs">
      <div class="filter-tab" :class="{ active: activeTab === 'employees', disabled: isLoading }"
        @click="!isLoading && $emit('update:activeTab', 'employees')">
        <svg class="tab-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.6667 14V12.6667C14.6667 11.4241 13.8169 10.38 12.6667 10.084M10.3334 2.19384C11.3107 2.58943 12 3.54754 12 4.66667C12 5.78579 11.3107 6.7439 10.3334 7.13949M11.3334 14C11.3334 12.7575 11.3334 12.1362 11.1304 11.6462C10.8597 10.9928 10.3406 10.4736 9.6872 10.203C9.19714 10 8.57589 10 7.33337 10H5.33337C4.09086 10 3.46961 10 2.97955 10.203C2.32614 10.4736 1.80701 10.9928 1.53636 11.6462C1.33337 12.1362 1.33337 12.7575 1.33337 14M9.00004 4.66667C9.00004 6.13943 7.80613 7.33333 6.33337 7.33333C4.86061 7.33333 3.66671 6.13943 3.66671 4.66667C3.66671 3.19391 4.86061 2 6.33337 2C7.80613 2 9.00004 3.19391 9.00004 4.66667Z"
            stroke="#636363" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="filter-tab-text">Сотрудники</span>
      </div>

      <div class="filter-tab" :class="{ active: activeTab === 'tasks', disabled: isLoading }"
        @click="!isLoading && $emit('update:activeTab', 'tasks')">
        <svg class="tab-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.16667 9.16667L4.5 10.5L7.5 7.5M4.5 4.5V2.63333C4.5 1.8866 4.5 1.51323 4.64532 1.22801C4.77316 0.97713 4.97713 0.773156 5.22801 0.645325C5.51323 0.5 5.8866 0.5 6.63333 0.5H11.7C12.4467 0.5 12.8201 0.5 13.1053 0.645325C13.3562 0.773156 13.5602 0.97713 13.688 1.22801C13.8333 1.51323 13.8333 1.8866 13.8333 2.63333V7.7C13.8333 8.44674 13.8333 8.82011 13.688 9.10532C13.5602 9.3562 13.3562 9.56018 13.1053 9.68801C12.8201 9.83333 12.4467 9.83333 11.7 9.83333H9.83333M2.63333 13.8333H7.7C8.44674 13.8333 8.82011 13.8333 9.10532 13.688C9.3562 13.5602 9.56018 13.3562 9.68801 13.1053C9.83333 12.8201 9.83333 12.4467 9.83333 11.7V6.63333C9.83333 5.8866 9.83333 5.51323 9.68801 5.22801C9.56018 4.97713 9.3562 4.77316 9.10532 4.64532C8.82011 4.5 8.44674 4.5 7.7 4.5H2.63333C1.8866 4.5 1.51323 4.5 1.22801 4.64532C0.97713 4.77316 0.773156 4.97713 0.645325 5.22801C0.5 5.51323 0.5 5.8866 0.5 6.63333V11.7C0.5 12.4467 0.5 12.8201 0.645325 13.1053C0.773156 13.3562 0.97713 13.5602 1.22801 13.688C1.51323 13.8333 1.8866 13.8333 2.63333 13.8333Z"
            stroke="#636363" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="filter-tab-text">Задачи</span>
      </div>
    </div>

    <!-- Блок выбора периода (общий для сотрудников и задач) -->
    <div class="tab-content">
      <div class="period-selector">
        <div class="preset-buttons">
          <button class="preset-btn" :class="{ active: preset === 'day' }" @click="setPreset('day')">День</button>
          <button class="preset-btn" :class="{ active: preset === 'period' }" @click="setPreset('period')">Период</button>
          <button class="preset-btn" :class="{ active: preset === 'today' }" @click="setPreset('today')">Сегодня</button>
          <button class="preset-btn" :class="{ active: preset === 'week' }" @click="setPreset('week')">Неделя</button>
          <button class="preset-btn" :class="{ active: preset === 'month' }" @click="setPreset('month')">Месяц</button>
          <button class="preset-btn" :class="{ active: preset === 'year' }" @click="setPreset('year')">Год</button>
          <button class="preset-btn" :class="{ active: timeFilter === 'incomplete' }" @click="setTimeFilter('incomplete')">
            Без времени ({{ noTimeCount }})
          </button>
        </div>

        <!-- Поля для ручного ввода дат (День или Период) -->
        <div v-if="preset === 'day' || preset === 'period'" class="custom-range">
          <div class="date-inputs">
            <div class="date-field">
              <label>{{ preset === 'day' ? 'Дата' : 'С' }}</label>
              <input type="date" :value="dateFrom" @input="onDateFromChange($event.target.value)" />
            </div>

            <div v-if="preset === 'period'" class="date-field">
              <label>По</label>
              <input type="date" :value="dateTo" @input="onDateToChange($event.target.value)" />
            </div>
            <div v-if="isWeekendRange" class="weekend-warning">Выбранный период - выходные</div>
          </div>
        </div>
      </div>

      <!-- Фильтры для сотрудников -->
      <div v-if="activeTab === 'employees'">
        <div class="workload-filters">
          <div class="workload-chip" :class="{ active: workloadFilter === 'all' }"
            @click="!isLoading && $emit('update:workloadFilter', 'all')">Все загруженности</div>
          <div class="workload-chip" :class="{ active: workloadFilter === 'overload' }"
            @click="!isLoading && $emit('update:workloadFilter', 'overload')">Перегружены</div>
          <div class="workload-chip" :class="{ active: workloadFilter === 'normal' }"
            @click="!isLoading && $emit('update:workloadFilter', 'normal')">Норма</div>
          <div class="workload-chip" :class="{ active: workloadFilter === 'free' }"
            @click="!isLoading && $emit('update:workloadFilter', 'free')">Свободны</div>
        </div>

        <div class="search-field">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                stroke="#636363" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <input type="text" class="search-input" placeholder="Поиск..." :value="search" :disabled="isLoading"
            @input="$emit('update:search', $event.target.value)" />
        </div>
      </div>

      <!-- Фильтры для задач -->
      <div v-else-if="activeTab === 'tasks'">
        <div class="task-filters">
          <div class="task-filter-chip" :class="{ active: taskStatusFilter === 'all' }"
            @click="$emit('update:taskStatusFilter', 'all')">Все статусы</div>
          <div class="task-filter-chip" :class="{ active: taskStatusFilter === 'pending' }"
            @click="$emit('update:taskStatusFilter', 'pending')">Ожидает выполнения</div>
          <div class="task-filter-chip" :class="{ active: taskStatusFilter === 'inProgress' }"
            @click="$emit('update:taskStatusFilter', 'inProgress')">Выполняется</div>
          <div class="task-filter-chip" :class="{ active: taskStatusFilter === 'waiting' }"
            @click="$emit('update:taskStatusFilter', 'waiting')">Ждет контроля</div>
          <div class="task-filter-chip" :class="{ active: taskStatusFilter === 'completed' }"
            @click="$emit('update:taskStatusFilter', 'completed')">Завершена</div>
        </div>

        <div class="search-field">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                stroke="#636363" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <input type="text" class="search-input" placeholder="Поиск..." :value="taskSearch" :disabled="isLoading"
            @input="$emit('update:taskSearch', $event.target.value)" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  workloadFilter: { type: String, default: 'all' },
  taskSearch: { type: String, default: '' },
  taskStatusFilter: { type: String, default: 'all' },
  activeTab: { type: String, default: 'employees' },
  isLoading: { type: Boolean, default: false },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
  timeFilter: { type: String, default: 'all' },
  noTimeCount: { type: Number, default: 0 }
})

const emit = defineEmits([
  'update:search', 'update:workloadFilter', 'update:taskSearch',
  'update:taskStatusFilter', 'update:activeTab',
  'update:dateFrom', 'update:dateTo', 'update:timeFilter'
])

const preset = ref('today')
const dayState = ref({ from: '', to: '' })
const periodState = ref({ from: '', to: '' })

const getToday = () => new Date().toISOString().split('T')[0]
const addDays = (dateStr, days) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const getWeekRange = (offsetWeeks = 0) => {
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? 6 : day - 1) + offsetWeeks * 7
  const monday = new Date(now); monday.setDate(now.getDate() - diff)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  return {
    from: monday.toISOString().split('T')[0],
    to: sunday.toISOString().split('T')[0]
  }
}
const getMonthRange = (offsetMonths = 0) => {
  const now = new Date(); now.setMonth(now.getMonth() + offsetMonths)
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: first.toISOString().split('T')[0],
    to: last.toISOString().split('T')[0]
  }
}
const getYearRange = () => {
  const now = new Date()
  const first = new Date(now.getFullYear(), 0, 1)
  const last = new Date(now.getFullYear(), 11, 31)
  return {
    from: first.toISOString().split('T')[0],
    to: last.toISOString().split('T')[0]
  }
}

function initStates() {
  const today = getToday()
  dayState.value = { from: today, to: today }
  const week = getWeekRange(0)
  periodState.value = { from: week.from, to: week.to }
}

function setPreset(name) {
  // Если выбран "Без времени" – сбрасываем его
  if (props.timeFilter === 'incomplete') {
    emit('update:timeFilter', 'all')
  }
  preset.value = name
  let from = '', to = ''
  switch (name) {
    case 'today': from = to = getToday(); break
    case 'week': { const r = getWeekRange(0); from = r.from; to = r.to; break }
    case 'month': { const r = getMonthRange(0); from = r.from; to = r.to; break }
    case 'year': { const r = getYearRange(); from = r.from; to = r.to; break }
    case 'day':
      from = dayState.value.from || getToday()
      to = dayState.value.to || getToday()
      break
    case 'period':
      from = periodState.value.from || getWeekRange(0).from
      to = periodState.value.to || getWeekRange(0).to
      break
    default: return
  }
  emit('update:dateFrom', from)
  emit('update:dateTo', to)
}

function setTimeFilter(value) {
  if (value === 'incomplete') {
    preset.value = null
    emit('update:timeFilter', 'incomplete')
  } else {
    emit('update:timeFilter', 'all')
  }
}

// --- Исправленная обработка ручного изменения дат ---

const onDateFromChange = (value) => {
  if (preset.value === 'day') {
    let from = value, to = value
    dayState.value = { from, to }
    emit('update:dateFrom', from)
    emit('update:dateTo', to)
    return
  }
  if (preset.value === 'period') {
    let from = value
    let to = props.dateTo

    // Если "По" не задано – устанавливаем равным "С"
    if (!to) {
      to = from
    }

    // Если "С" >= "По" – меняем местами
    if (from && to && from >= to) {
      const tempFrom = from
      from = to
      to = tempFrom
    }

    periodState.value = { from, to }
    emit('update:dateFrom', from)
    emit('update:dateTo', to)
  }
}

const onDateToChange = (value) => {
  if (preset.value === 'day') {
    let from = value, to = value
    dayState.value = { from, to }
    emit('update:dateFrom', from)
    emit('update:dateTo', to)
    return
  }
  if (preset.value === 'period') {
    let to = value
    let from = props.dateFrom

    // Если "С" не задано – устанавливаем равным "По"
    if (!from) {
      from = to
    }

    // Если "По" <= "С" – меняем местами
    if (from && to && to <= from) {
      const tempTo = to
      to = from
      from = tempTo
    }

    periodState.value = { from, to }
    emit('update:dateFrom', from)
    emit('update:dateTo', to)
  }
}

const isWeekendRange = computed(() => {
  if (!props.dateFrom || !props.dateTo) return false
  const from = new Date(props.dateFrom)
  const to = new Date(props.dateTo)
  let current = new Date(from)
  while (current <= to) {
    if (current.getDay() !== 0 && current.getDay() !== 6) return false
    current.setDate(current.getDate() + 1)
  }
  return true
})

onMounted(() => {
  initStates()
  setPreset('today')
})
</script>

<style scoped>
.weekend-warning { color: #E24B4A; font-size: 14px; font-weight: 500; margin-top: 4px; }
.employee-filters { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.filter-tabs { display: flex; gap: 20px; flex-wrap: wrap; }
.filter-tab { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #F5F4ED; border: 1px solid #D5D4CE; border-radius: 4px; cursor: pointer; transition: 0.2s; }
.filter-tab.active { border-color: #636363; background: #EBEAE2; }
.filter-tab.disabled { opacity: 0.5; cursor: not-allowed; }
.tab-icon { flex-shrink: 0; }
.filter-tab-text { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 20px; color: #636363; }
.tab-content { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.period-selector { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.preset-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
.preset-btn { padding: 4px 12px; border: 1px solid #D5D4CE; border-radius: 52px; background: #F5F4ED; font-family: 'Inter', sans-serif; font-size: 16px; color: #636363; cursor: pointer; transition: 0.15s; }
.preset-btn.active { border-color: #636363; background: #E2E1D9; }
.preset-btn:hover { background: #EBEAE2; }
.custom-range { display: flex; flex-direction: column; gap: 6px; padding: 6px 0; }
.date-inputs { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.date-field { display: flex; align-items: center; gap: 6px; }
.date-field label { font-size: 14px; color: #636363; }
.date-field input[type="date"] { padding: 4px 8px; border: 1px solid #D5D4CE; border-radius: 4px; font-family: inherit; font-size: 14px; background: white; color: #141413; }
.workload-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.workload-chip { padding: 4px 12px; background: #F5F4ED; border: 1px solid #D5D4CE; border-radius: 52px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; color: #636363; transition: 0.15s; }
.workload-chip.active { border-color: #636363; background: #E2E1D9; }
.workload-chip:hover { background: #EBEAE2; }
.search-field { display: flex; align-items: center; padding: 6px 12px; gap: 10px; width: 100%; background: #FFFFFF; border: 1px solid #D5D4CE; border-radius: 6px; margin-top: 0; }
.search-icon { display: flex; align-items: center; }
.search-input { border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 18px; width: 100%; background: transparent; color: #636363; }
.search-input::placeholder { color: #636363; opacity: 0.7; }
.search-input:disabled { opacity: 0.6; cursor: not-allowed; }
.task-filters { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; margin-bottom: 12px; }
.task-filter-chip { padding: 4px 12px; background: #F5F4ED; border: 1px solid #D5D4CE; border-radius: 52px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; color: #636363; transition: 0.15s; }
.task-filter-chip.active { border-color: #636363; background: #E2E1D9; }
.task-filter-chip:hover { background: #EBEAE2; }

@media (max-width: 768px) {
  .filter-tab-text { font-size: 16px; }
  .workload-chip, .task-filter-chip { font-size: 14px; }
  .search-input { font-size: 16px; }
  .date-field input[type="date"] { font-size: 13px; }
}
@media (max-width: 480px) {
  .filter-tabs { gap: 10px; }
  .filter-tab { padding: 2px 6px; }
  .filter-tab-text { font-size: 14px; }
  .preset-btn { font-size: 13px; padding: 3px 10px; }
}
</style>