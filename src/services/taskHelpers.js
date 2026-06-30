export function isOverlapping(taskStart, taskEnd, rangeStart, rangeEnd) {
  const start = taskStart || new Date(0)
  const end = taskEnd || new Date(8640000000000000)
  return start <= rangeEnd && end >= rangeStart
}

export function getTaskInterval(task) {
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

export function getTaskTime(task) {
  if (task.status === 'completed') {
    if (task.timeSpent > 0) return task.timeSpent
    if (task.timeEstimate > 0) return task.timeEstimate
    return 0
  } else {
    return task.timeEstimate > 0 ? task.timeEstimate : 0
  }
}

export function isTaskIncomplete(task) {
  const hasStart = !!(task.plannedStart || task.createdDate)
  let hasEnd = false
  if (task.status === 'completed') {
    hasEnd = !!(task.closedDate || task.plannedEnd || task.deadline)
  } else {
    hasEnd = !!(task.plannedEnd || task.deadline)
  }
  const time = getTaskTime(task)
  return !hasStart || !hasEnd || time === 0
}

export function getWorkingDaysCount(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function isTaskInPeriod(task, from, to) {
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