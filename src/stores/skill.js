import { defineStore } from 'pinia'

export const useSkillStore = defineStore('skill', {
  state: () => ({
    skills: [
      {
        name: 'Web Development',
        count: 15
      },
      {
        name: 'Database',
        count: 12
      },
      {
        name: 'Java Programming',
        count: 10
      },
      {
        name: 'Data Structures',
        count: 8
      }
    ]
  }),

  getters: {
    trendingSkills(state) {
      return [...state.skills]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  }
})