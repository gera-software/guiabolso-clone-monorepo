import { defineStore } from 'pinia'
import { ref } from 'vue'

const currentDate = new Date()
const year = currentDate.getFullYear()
const month = currentDate.getMonth() + 1

const currentMonth = `${month.toString().padStart(2, '0')}-${year}`

export const useMonthFilterStore = defineStore('monthFilter', () => {

        const monthFilter = ref(currentMonth)

        const monthOptions = [
            { text: "Dezembro/24", value: "12-2024" },
            { text: "Novembro/24", value: "11-2024" },
            { text: "Outubro/24", value: "10-2024" },
            { text: "Setembro/24", value: "09-2024" },
            { text: "Agosto/24", value: "08-2024" },
            { text: "Julho/24", value: "07-2024" },
            { text: "Junho/24", value: "06-2024" },
            { text: "Maio/24", value: "05-2024" },
            { text: "Abril/24", value: "04-2024" },
            { text: "Março/24", value: "03-2024" },
            { text: "Fevereiro/24", value: "02-2024" },
            { text: "Janeiro/24", value: "01-2024" },
                
            { text: "Dezembro/23", value: "12-2023" },
            { text: "Novembro/23", value: "11-2023" },
            { text: "Outubro/23", value: "10-2023" },
            { text: "Setembro/23", value: "09-2023" },
            { text: "Agosto/23", value: "08-2023" },
            { text: "Julho/23", value: "07-2023" },
            { text: "Junho/23", value: "06-2023" },
            { text: "Maio/23", value: "05-2023" },
            { text: "Abril/23", value: "04-2023" },
            { text: "Março/23", value: "03-2023" },
            { text: "Fevereiro/23", value: "02-2023" },
            { text: "Janeiro/23", value: "01-2023" },

            { text: "Dezembro/22", value: "12-2022" },
            { text: "Novembro/22", value: "11-2022" },
            { text: "Outubro/22", value: "10-2022" },
            { text: "Setembro/22", value: "09-2022" },
            { text: "Agosto/22", value: "08-2022" },
            { text: "Julho/22", value: "07-2022" },
            { text: "Junho/22", value: "06-2022" },
            { text: "Maio/22", value: "05-2022" },
            { text: "Abril/22", value: "04-2022" },
            { text: "Março/22", value: "03-2022" },
            { text: "Fevereiro/22", value: "02-2022" },
            { text: "Janeiro/22", value: "01-2022" },

            { text: "Dezembro/21", value: "12-2021" },
            { text: "Novembro/21", value: "11-2021" },
            { text: "Outubro/21", value: "10-2021" },
            { text: "Setembro/21", value: "09-2021" },
            { text: "Agosto/21", value: "08-2021" },
            { text: "Julho/21", value: "07-2021" },
            { text: "Junho/21", value: "06-2021" },
            { text: "Maio/21", value: "05-2021" },
            { text: "Abril/21", value: "04-2021" },
            { text: "Março/21", value: "03-2021" },
            { text: "Fevereiro/21", value: "02-2021" },
            { text: "Janeiro/21", value: "01-2021" },

            { text: "Dezembro/20", value: "12-2020" },
            { text: "Novembro/20", value: "11-2020" },
            { text: "Outubro/20", value: "10-2020" },
            { text: "Setembro/20", value: "09-2020" },
            { text: "Agosto/20", value: "08-2020" },
            { text: "Julho/20", value: "07-2020" },
            { text: "Junho/20", value: "06-2020" },
            { text: "Maio/20", value: "05-2020" },
            { text: "Abril/20", value: "04-2020" },
            { text: "Março/20", value: "03-2020" },
            { text: "Fevereiro/20", value: "02-2020" },
            { text: "Janeiro/20", value: "01-2020" },

            { text: "Dezembro/19", value: "12-2019" },
            { text: "Novembro/19", value: "11-2019" },
            { text: "Outubro/19", value: "10-2019" },
            { text: "Setembro/19", value: "09-2019" },
            { text: "Agosto/19", value: "08-2019" },
            { text: "Julho/19", value: "07-2019" },
            { text: "Junho/19", value: "06-2019" },
            { text: "Maio/19", value: "05-2019" },
            { text: "Abril/19", value: "04-2019" },
            { text: "Março/19", value: "03-2019" },
            { text: "Fevereiro/19", value: "02-2019" },
            { text: "Janeiro/19", value: "01-2019" },
        ]

        function isCurrentMonthSelected() {
           return monthFilter.value === currentMonth
        }

        return {
            monthFilter,
            monthOptions,
            isCurrentMonthSelected,
        }
  
})
