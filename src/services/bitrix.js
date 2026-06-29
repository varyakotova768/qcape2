const WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK

if (!WEBHOOK_URL) {
  console.warn('VITE_BITRIX_WEBHOOK не задан в .env файле')
}

class BitrixService {
  constructor() {
    this.baseUrl = WEBHOOK_URL
    this.usersCache = null
    this.tasksCache = null
  }

  // Возвращает базовый URL портала (без /rest/...)
  getPortalUrl() {
    if (!this.baseUrl) return ''
    const match = this.baseUrl.match(/^(https?:\/\/[^\/]+)/)
    return match ? match[1] : ''
  }

  // Базовый метод для запросов к API
  async call(method, params = {}) {
    if (!this.baseUrl) {
      throw new Error('WEBHOOK_URL не настроен')
    }
    try {
      const response = await fetch(`${this.baseUrl}${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await response.json()
      if (data.error) {
        throw new Error(`Bitrix API Error: ${data.error_description || data.error}`)
      }
      return data.result
    } catch (error) {
      console.error(`Ошибка при вызове ${method}:`, error)
      throw error
    }
  }

  // Получение списка активных сотрудников
  async getUsers() {
    const users = await this.call('user.get', {
      filter: { ACTIVE: 'Y' },
      select: ['ID', 'NAME', 'LAST_NAME', 'PERSONAL_PHOTO', 'WORK_POSITION', 'EMAIL'],
    })
    return users.map(user => ({
      id: Number(user.ID),
      name: `${user.NAME || user.name || ''} ${user.LAST_NAME || user.lastName || ''}`.trim() || `Пользователь ${user.ID || user.id}`,
      position: user.WORK_POSITION || user.workPosition || '',
      avatar: user.PERSONAL_PHOTO || user.personalPhoto || '',
      plannedHours: 0,
      capacity: 8,
      loadStatus: 'free',
      tasks: [],
    }))
  }

  // Получение затраченного времени
  async getTaskElapsedTime(taskId) {
    try {
      const result = await this.call('task.elapseditem.getlist', [
        { ID: 'DESC' },
        { TASK_ID: taskId },
        ['SECONDS', 'MINUTES', 'ID'],
        { NAV_PARAMS: { nPageSize: 50 } }
      ])
      let totalSeconds = 0
      if (Array.isArray(result)) {
        result.forEach(entry => {
          totalSeconds += Number(entry.SECONDS) || 0
        })
      }
      return totalSeconds
    } catch (error) {
      console.warn(`Не удалось получить затраченное время для задачи ${taskId}:`, error)
      return 0
    }
  }

  // Получение списка задач
   async getTasks() {
    try {
      const response = await this.call('tasks.task.list', {
        filter: {},
        select: [
          'ID', 'TITLE', 'DESCRIPTION', 'STATUS', 'RESPONSIBLE_ID',
          'CREATED_BY', 'DATE_START', 'DEADLINE', 'START_DATE_PLAN',
          'END_DATE_PLAN', 'TIME_ESTIMATE', 'CLOSED_DATE', 'CREATED_DATE'
        ],
        order: { ID: 'DESC' },
      })
      
      let tasksData = response

      

      if (tasksData && typeof tasksData === 'object' && !Array.isArray(tasksData)) {
        tasksData = tasksData.tasks || tasksData.items || tasksData.result || []
      }
      if (!Array.isArray(tasksData)) tasksData = []
      // Исправленный маппинг статусов
      const statusMap = {
        1: 'pending',
        2: 'pending', 
        3: 'inProgress', 
        4: 'waiting',     
        5: 'completed',  
        6: 'pending',     
        7: 'waiting'      
      }

      const tasksWithTime = await Promise.all(
        tasksData.map(async (task) => {
          const id = task.id || task.ID
          const timeSpent = await this.getTaskElapsedTime(id)
          return {
            id: Number(id),
            title: task.title || task.TITLE || 'Без названия',
            description: task.description || task.DESCRIPTION || '',
            status: statusMap[task.status || task.STATUS] || 'pending',
            responsibleId: Number(task.responsibleId || task.RESPONSIBLE_ID),
            createdBy: Number(task.createdBy || task.CREATED_BY),
            plannedStart: task.startDatePlan || task.START_DATE_PLAN || null,
            plannedEnd: task.endDatePlan || task.END_DATE_PLAN || null,
            deadline: task.deadline || task.DEADLINE || null,
            createdDate: task.createdDate || task.CREATED_DATE || null,
            closedDate: task.closedDate || task.CLOSED_DATE || null,
            timeEstimate: Number(task.timeEstimate || task.TIME_ESTIMATE || 0),
            timeSpent: timeSpent,
          }
        })
      )
      return tasksWithTime
    } catch (error) {
      console.error('Ошибка получения задач:', error)
      throw error
    }
  }

  // Метод для получения данных (без задержек и моков)
  async fetchUsers() {
    const users = await this.getUsers()
    this.usersCache = users
    return users
  }

  // Метод для получения задач (без задержек и моков)
  async fetchTasks() {
    const tasks = await this.getTasks()
    this.tasksCache = tasks
    return tasks
  }

  // Получение всех данных (сотрудники + задачи)
  async fetchAllData() {
    const [users, tasks] = await Promise.all([
      this.fetchUsers(),
      this.fetchTasks()
    ])
    return { users, tasks }
  }
}

export const bitrixService = new BitrixService()