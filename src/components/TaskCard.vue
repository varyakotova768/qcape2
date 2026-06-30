<template>
  <div class="task-card">
    <div class="task-main">
      <div class="task-body">
        <div class="task-header">
          <div class="task-title">{{ task.title }}</div>
          <div
            class="task-description"
            :class="{ expanded: isExpanded }"
            ref="descriptionRef"
            v-html="cleanedDescription"
          ></div>
          <button
            v-if="isOverflowing"
            class="toggle-description-btn"
            @click="toggleExpand"
          >
            {{ isExpanded ? 'Свернуть' : 'Показать полностью' }}
          </button>
        </div>
      </div>

      <div class="task-sidebar">
        <TaskStatusBadge :status="task.status" />

        <div class="task-executor">
          <div class="executor-info">
            <span class="executor-name">{{ executorName }}</span>
            <span class="executor-position">{{ executorPosition }}</span>
          </div>
          <div class="executor-avatar" :style="avatarStyle"></div>
        </div>

        <BitrixLink @click="$emit('openBitrix', task.id)" />
      </div>
    </div>

    <div class="task-meta">
      <div class="meta-item meta-time">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99996 8.66671V6.00004M14 4.00004L12.6666 2.66671M6.66663 1.33337H9.33329M7.99996 14C5.05444 14 2.66663 11.6122 2.66663 8.66671C2.66663 5.72119 5.05444 3.33337 7.99996 3.33337C10.9455 3.33337 13.3333 5.72119 13.3333 8.66671C13.3333 11.6122 10.9455 14 7.99996 14Z" stroke="#3C3489" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="meta-text meta-time-text">
          <span :class="{ 'time-zero': spentSeconds === 0 }">{{ spentFormatted }}</span>
          <span> / </span>
          <span :class="estimateClass">{{ estimateFormatted }}</span>
        </span>
      </div>

      <div class="meta-item meta-start">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6H14M2 6V11.8668C2 12.6135 2 12.9867 2.16349 13.2719C2.3073 13.5228 2.5366 13.727 2.81885 13.8548C3.1394 14 3.55925 14 4.39768 14H8M2 6V5.4668C2 4.72006 2 4.34641 2.16349 4.0612C2.3073 3.81032 2.5366 3.60649 2.81885 3.47866C3.13972 3.33333 3.56007 3.33333 4.40015 3.33333H5M14 6V5.46461C14 4.71933 14 4.34613 13.8367 4.0612C13.6929 3.81032 13.4632 3.60649 13.1809 3.47866C12.86 3.33333 12.4402 3.33333 11.6001 3.33333H11M14 6C14 6 14 7.9379 14 9.5M5 3.33333H11M5 3.33333V2M11 3.33333V2M10 9L14.5 12L10 15V9Z" stroke="#0C447C" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="meta-text meta-start-text">{{ startDateDisplay }}</span>
      </div>

      <div class="meta-item meta-end">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6H14M2 6V11.8668C2 12.6135 2 12.9867 2.16349 13.2719C2.3073 13.5228 2.5366 13.727 2.81885 13.8548C3.1394 14 3.55925 14 4.39768 14H8M2 6V5.4668C2 4.72006 2 4.34641 2.16349 4.0612C2.3073 3.81032 2.5366 3.60649 2.81885 3.47866C3.13972 3.33333 3.56007 3.33333 4.40015 3.33333H5M14 6V5.46461C14 4.71933 14 4.34613 13.8367 4.0612C13.6929 3.81032 13.4628 3.60649 13.1805 3.47866C12.8597 3.33333 12.4402 3.33333 11.6001 3.33333H11M14 6V8M5 3.33333H11M5 3.33333V2M11 3.33333V2" :stroke="endIconColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 9.33333V11H12.6667M11 14C9.34315 14 8 12.6569 8 11C8 9.34315 9.34315 8 11 8C12.6569 8 14 9.34315 14 11C14 12.6569 12.6569 14 11 14Z" :stroke="endIconColor" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="meta-text meta-end-text" :class="endTextClass">{{ endDateDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import TaskStatusBadge from './TaskStatusBadge.vue'
import BitrixLink from './BitrixLink.vue'

const props = defineProps({
  task: { type: Object, required: true },
  employees: { type: Array, default: () => [] }
})

defineEmits(['openBitrix'])

const formatTimeHM = (seconds) => {
  if (!seconds || seconds <= 0) return '--:--'
  const totalSeconds = Math.round(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const spentSeconds = computed(() => Number(props.task.timeSpent) || 0)
const estimateSeconds = computed(() => Number(props.task.timeEstimate) || 0)
const spentFormatted = computed(() => formatTimeHM(spentSeconds.value))
const estimateFormatted = computed(() => formatTimeHM(estimateSeconds.value))

const estimateClass = computed(() => {
  if (estimateSeconds.value === 0) return 'time-zero'
  if (spentSeconds.value > estimateSeconds.value) return 'time-over'
  return ''
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const d = new Date(dateString)
  const day = d.getDate()
  const month = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][d.getMonth()]
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hours}:${minutes}`
}

const startDateDisplay = computed(() => {
  const date = props.task.plannedStart || props.task.createdDate
  return formatDate(date)
})

const endDateDisplay = computed(() => {
  let date = null
  if (props.task.status === 'completed') {
    date = props.task.closedDate || props.task.plannedEnd || props.task.deadline
  } else {
    date = props.task.plannedEnd || props.task.deadline
  }
  return formatDate(date)
})

const effectiveEndDate = computed(() => {
  if (props.task.status === 'completed') return null
  const endDate = props.task.plannedEnd ? new Date(props.task.plannedEnd) : null
  if (endDate) return endDate
  const deadline = props.task.deadline ? new Date(props.task.deadline) : null
  return deadline
})

const endTextClass = computed(() => {
  if (props.task.status === 'completed') {
    return 'completed'
  }
  const endDate = effectiveEndDate.value
  if (!endDate) return ''
  const now = new Date()
  if (endDate < now) return 'deadline-overdue'
  return ''
})

const endIconColor = computed(() => {
  if (props.task.status === 'completed') {
    return '#416517'
  }
  const endDate = effectiveEndDate.value
  if (!endDate) return '#0C447C'
  const now = new Date()
  if (endDate < now) return '#E24B4A'
  return '#0C447C'
})

const executor = computed(() => {
  if (!props.task.responsibleId) return null
  return props.employees.find(e => e.id === props.task.responsibleId) || null
})
const executorName = computed(() => executor.value?.name || 'Не назначен')
const executorPosition = computed(() => executor.value?.position || '')
const avatarStyle = computed(() => {
  if (executor.value?.avatar) {
    return { backgroundImage: `url(${executor.value.avatar})` }
  }
  return {}
})

const cleanedDescription = computed(() => {
  let text = props.task.description || ''
  text = text.replace(/\[[^\]]*\]/g, '')
  text = text.replace(/\n{2,}/g, '\n')
  text = text.replace(/\n/g, '<br>')
  return text
})

const isExpanded = ref(false)
const isOverflowing = ref(false)
const descriptionRef = ref(null)

const checkOverflow = () => {
  const el = descriptionRef.value
  if (!el) return
  const wasExpanded = isExpanded.value
  if (!wasExpanded) {
    el.style.maxHeight = 'none'
  }
  const fullHeight = el.scrollHeight
  if (!wasExpanded) {
    el.style.maxHeight = ''
  }
  const computedStyle = getComputedStyle(el)
  const limit = parseFloat(computedStyle.maxHeight) || 72
  isOverflowing.value = fullHeight > limit + 2
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  nextTick(checkOverflow)
})
watch(() => props.task.description, () => {
  isExpanded.value = false
  nextTick(checkOverflow)
})
</script>

<style scoped>
.task-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px;
  gap: 8px;
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #D5D4CE;
  border-radius: 10px;
}
.task-main {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}
.task-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 12px;
}
.task-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-title {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 20px;
  color: #141413;
  word-break: break-word;
}
.task-description {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #636363;
  word-break: break-word;
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.task-description.expanded {
  max-height: none;
}
.toggle-description-btn {
  align-self: flex-start;
  background: none;
  border: none;
  color: #636363;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.2s;
}
.toggle-description-btn:hover {
  opacity: 0.7;
}
.task-meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 20px;
  width: 100%;
}
.meta-item {
  display: flex;
  align-items: center;
  padding: 0px;
  gap: 4px;
}
.meta-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
}
.meta-time-text {
  color: #3C3489;
}
.meta-start-text {
  color: #0C447C;
}
.meta-end-text {
  color: #0C447C;
}
.meta-end-text.deadline-overdue {
  color: #E24B4A !important;
}
.meta-end-text.completed {
  color: #416517 !important;
}
.time-over {
  color: #E24B4A;
}
.time-zero {
  color: #999999;
}
.task-sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0px;
  gap: 10px;
  flex-shrink: 0;
}
.task-executor {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  justify-content: flex-end;
}
.executor-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
}
.executor-name {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #141413;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.executor-position {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #636363;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.executor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #ddd;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .task-card { padding: 12px; }
  .task-main { flex-direction: column; gap: 8px; }
  .task-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; justify-content: space-between; }
  .task-executor { justify-content: flex-start; width: auto; }
  .executor-info { align-items: flex-start; }
  .executor-name { text-align: left; font-size: 14px; }
  .executor-position { text-align: left; }
  .task-title { font-size: 17px; }
  .task-description { font-size: 14px; max-height: 4.2em; }
  .task-meta { gap: 6px 14px; }
}
@media (max-width: 480px) {
  .task-card { padding: 10px; }
  .task-title { font-size: 15px; }
  .task-description { font-size: 13px; max-height: 3.9em; }
  .meta-text { font-size: 12px; }
  .meta-item svg { width: 14px; height: 14px; }
  .task-sidebar { gap: 6px; }
  .executor-name { font-size: 13px; }
  .executor-avatar { width: 28px; height: 28px; }
  .task-meta { gap: 4px 10px; }
}
</style>