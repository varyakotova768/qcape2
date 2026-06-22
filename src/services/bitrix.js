// Сервис для работы с API Битрикс24

const WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK

if (!WEBHOOK_URL) {
  console.warn('VITE_BITRIX_WEBHOOK не задан в .env файле')
}

class BitrixService {
  constructor() {
    this.baseUrl = WEBHOOK_URL
  }

  // Базовый метод для запросов к API
  async call(method, params = {}) {
    if (!this.baseUrl) {
      throw new Error('WEBHOOK_URL не настроен')
    }

    try {
      const response = await fetch(`${this.baseUrl}${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

    // Преобразуем данные в нужный формат
    return users.map(user => ({
      id: user.ID,
      name: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || `Пользователь ${user.ID}`,
      position: user.WORK_POSITION || '',
      avatar: user.PERSONAL_PHOTO || '',
      plannedHours: 0,
      capacity: 8,
      loadStatus: 'free',
      tasks: [],
    }))
  }

  // Метод для получения данных с задержкой (имитация загрузки)
  async fetchUsers() {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const users = await this.getUsers()
          resolve(users)
        } catch (error) {
          // Если ошибка - возвращаем тестовые данные
          console.warn('Используем тестовые данные из-за ошибки:', error)
          resolve(this.getMockUsers())
        }
      }, 500)
    })
  }

  // Тестовые данные для отладки (если API недоступен)
  getMockUsers() {
    return [
      {
        id: 1,
        name: 'Петр Федоров',
        position: 'Backend Developer',
        avatar: '',
        plannedHours: 0,
        capacity: 8,
        loadStatus: 'free',
        tasks: []
      },
      {
        id: 2,
        name: 'Иван Иванов',
        position: 'QA Engineer',
        avatar: '',
        plannedHours: 0,
        capacity: 8,
        loadStatus: 'free',
        tasks: []
      },
      {
        id: 3,
        name: 'Василиса Васильева',
        position: 'Android Developer',
        avatar: '',
        plannedHours: 0,
        capacity: 8,
        loadStatus: 'free',
        tasks: []
      },
      {
        id: 4,
        name: 'Мария Ромашкова',
        position: 'Frontend Developer',
        avatar: '',
        plannedHours: 0,
        capacity: 8,
        loadStatus: 'free',
        tasks: []
      }
    ]
  }
}

export const bitrixService = new BitrixService()