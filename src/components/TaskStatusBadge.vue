<template>
  <div class="task-status-badge" :class="badgeClass">
    <svg v-if="statusType === 'pending'" class="status-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path stroke-width="1.5"
        d="M12.1084 1.33334H3.89167C3.58333 1.33334 3.33337 1.5833 3.33337 1.89164C3.33337 3.66847 4.03921 5.37252 5.29562 6.62892L6.10841 7.44171C6.18913 7.52243 6.22948 7.56279 6.25838 7.60154C6.43463 7.83795 6.43463 8.16207 6.25838 8.39848C6.22948 8.43723 6.18913 8.47759 6.10841 8.5583L5.29562 9.37109C4.03922 10.6275 3.33337 12.3316 3.33337 14.1084C3.33337 14.4167 3.58333 14.6667 3.89167 14.6667H12.1084C12.4167 14.6667 12.6667 14.4167 12.6667 14.1084C12.6667 12.3316 11.9609 10.6275 10.7045 9.37109L9.89167 8.5583C9.81095 8.47759 9.7706 8.43723 9.7417 8.39848C9.56545 8.16207 9.56545 7.83795 9.7417 7.60154C9.7706 7.56279 9.81095 7.52243 9.89167 7.44171L10.7045 6.62892C11.9609 5.37252 12.6667 3.66847 12.6667 1.89164C12.6667 1.5833 12.4167 1.33334 12.1084 1.33334Z"
        stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <svg v-else-if="statusType === 'waiting'" class="status-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path stroke-width="1.5"
        d="M6.66663 10.6667H3.33329V14M9.33329 5.33333H12.6666V2M3.0553 6.00227C3.42909 5.07711 4.05492 4.27536 4.86166 3.68815C5.6684 3.10094 6.62453 2.75168 7.6198 2.68034C8.61506 2.609 9.60978 2.81827 10.492 3.28441C11.3743 3.75055 12.1074 4.45503 12.6094 5.31742M12.945 9.99805C12.5712 10.9232 11.9454 11.725 11.1386 12.3122C10.3319 12.8994 9.37674 13.2482 8.38147 13.3195C7.3862 13.3909 6.39067 13.1816 5.50842 12.7155C4.62618 12.2494 3.89251 11.545 3.39058 10.6826"
        stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <svg v-else-if="statusType === 'inProgress'" class="status-icon" width="16" height="16" viewBox="0 0 16 16"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path stroke-width="1.5" d="M1 13L6.83333 8L1 3M9.16667 13L15 8L9.16667 3" stroke="currentColor"
        stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <svg v-else-if="statusType === 'completed'" class="status-icon" width="16" height="16" viewBox="0 0 16 16"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 4L5.99996 11.3333L2.66663 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>

    <span class="status-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const statusMap = {
  pending: { type: 'pending', label: 'Ожидает выполнения', color: 'orange' },
  waiting: { type: 'waiting', label: 'Ждет контроля', color: 'red' },
  inProgress: { type: 'inProgress', label: 'Выполняется', color: 'blue' },
  completed: { type: 'completed', label: 'Завершена', color: 'green' }
}

const statusType = computed(() => props.status)
const label = computed(() => statusMap[props.status]?.label || props.status)

const badgeClass = computed(() => {
  switch (props.status) {
    case 'pending': return 'status-orange'
    case 'waiting': return 'status-red'
    case 'inProgress': return 'status-blue'
    case 'completed': return 'status-green'
    default: return ''
  }
})
</script>

<style scoped>
.task-status-badge {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  gap: 5px;
  border-radius: 52px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  width: fit-content;
}

.status-icon {
  flex-shrink: 0;
  color: currentColor;
}

.status-orange {
  background: #FAEEDA;
  color: #D88C1B;
}

.status-red {
  background: #FAECE7;
  color: #E24B4A;
}

.status-blue {
  background: #E6F1FB;
  color: #0C447C;
}

.status-green {
  background: #EAF3DE;
  color: #416517;
}
</style>