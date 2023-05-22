<template>
    <div class="card" v-if="!isLoading">
        <div class="card-header">
            <h2>Gastos do mês</h2> 
            <router-link :to="{ name: 'extract'}">
              <font-awesome-icon icon="fa-solid fa-arrow-right-long" />
            </router-link>
        </div>
        <div class="card-body">
            <span v-if="(donutSlices.length == 0)">Ainda não há transações</span>
            <div v-else class="donut">
                <svg class="donut-chart" :viewBox="`0 0 ${viewBox} ${viewBox}`">
                    <path
                        v-for="slice in donutSlices" :key="slice.label"
                        :fill="slice.color"
                        :d="slice.commands"
                        :transform="`rotate(${slice.offset})`"
                    >
                        <title>{{slice.label}}</title>
                    </path>
                </svg>
                <ul class="donut-legend">
                    <li v-for="slice in donutSlices" :key="slice.label">
                        <div class="color" :style="{ 'background-color': slice.color }"></div>
                        <div class="label">{{ slice.label }}</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="card card--skeleton" v-if="isLoading">
        <div class="card-header">
            <div class="h2"></div>
        </div>
        <div class="card-body">
            <div class="donut-skeleton"></div>
            <div style="flex-basis: 40%">
              <div class="p" style="width: 100%"></div>
              <div class="p" style="width: 80%"></div>
              <div class="p" style="width: 100%"></div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useMonthFilterStore } from '../stores/monthFilterStore';
import api from "../config/axios.js";

export interface DonutSlice {
  percent: number;
  color: string;
  label?: string;
  onClickCb?: () => void;
}

interface DonutSliceWithCommands extends DonutSlice {
  offset: number; // This is the offset that we will use to rotate the slices
  commands: string; // This will be what goes inside the d attribute of the path tag
}


 function getSlicesWithCommandsAndOffsets(
    donutSlices: DonutSlice[],
    radius: number,
    svgSize: number,
    borderSize: number
  ): DonutSliceWithCommands[] {
    let previousPercent = 0;
    return donutSlices.map((slice) => {
      const sliceWithCommands: DonutSliceWithCommands = {
        ...slice,
        commands: getSliceCommands(slice, radius, svgSize, borderSize),
        offset: previousPercent * 3.6 * -1,
      };
      previousPercent += slice.percent;
      return sliceWithCommands;
    });
  }

 function getSliceCommands(
    donutSlice: DonutSlice,
    radius: number,
    svgSize: number,
    borderSize: number
  ): string {
    const degrees = percentToDegrees(donutSlice.percent);
    const longPathFlag = degrees > 180 ? 1 : 0;
    const innerRadius = radius - borderSize;

    const commands: string[] = [];
    commands.push(`M ${svgSize / 2 + radius} ${svgSize / 2}`);
    commands.push(
      `A ${radius} ${radius} 0 ${longPathFlag} 0 ${getCoordFromDegrees(
        degrees,
        radius,
        svgSize
      )}`
    );
    commands.push(
      `L ${getCoordFromDegrees(degrees, innerRadius, svgSize)}`
    );
    commands.push(
      `A ${innerRadius} ${innerRadius} 0 ${longPathFlag} 1 ${
        svgSize / 2 + innerRadius
      } ${svgSize / 2}`
    );
    return commands.join(' ');
  }

 function getCoordFromDegrees(angle: number, radius: number, svgSize: number): string {
    const x = Math.cos((angle * Math.PI) / 180);
    const y = Math.sin((angle * Math.PI) / 180);
    const coordX = x * radius + svgSize / 2;
    const coordY = y * -radius + svgSize / 2;
    return [coordX, coordY].join(' ');
  }

 function percentToDegrees(percent: number): number {
    // return percent * 3.6;
    // fix bug when the percent is 100% the slice is not drawing...
    return percent * 3.6 === 360 ? 359.99 : percent * 3.6
  }


const isLoading = ref(true)



const viewBox = ref(100);
const radius = ref(45);
const borderSize = ref(30);

const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()


monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user.data.id
  await getData(id, year, month)
})

const donutSlices = computed(() => {
     return getSlicesWithCommandsAndOffsets(data.value, radius.value, viewBox.value, borderSize.value)
})

const data = ref<DonutSlice[]>([])



async function getData(userId: String, year: String, month: String) {
  isLoading.value = true
  data.value = await api.guiabolsoApi({
    method: 'get',
    url: `/highest-monthly-spending-chart?id=${userId}&month=${month}&year=${year}`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user.data.id;
  await getData(id, year, month)
})


</script>

<style scoped>

.card {
  background-color: white;
  margin: 30px 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                       0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                       0px 2px 1px -1px rgba(0, 0, 0, 0.12);

}

.card-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 {
  font-weight: 600;
  color: #404040;
  font-size: 22px;
  margin: 0;
}
.card-header a {
  color: #F9386A;
}

.donut {
    display: flex;
    gap: 10px;
}

.donut-chart path {
    transform-origin: center;
}

.donut-legend {
    list-style-type: none;
    margin: 0;
    padding: 0;
    max-width: 40%;
}

.donut-legend li {
    padding: 10px 0;
    display: flex;
    gap: 10px;
    align-items: center;
}

.donut-legend .label {
    font-size: .8em;
    color: #454545;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.donut-legend .color {
    width: 1em;
    height: 1em;
    background-color: #D9D9D9;
    border-radius: 100%;
    flex-shrink: 0;
}

.card--skeleton {
  min-height: 274px;
}

.card--skeleton .h2 {
    background-color: rgb(0, 0, 0, 10%);
    height: 30px;
    width: 60%;
    margin-bottom: 10px;
    animation: pulse-bg 1s infinite;
}

.card--skeleton .card-body {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
}

.card--skeleton .donut-skeleton {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: rgb(0, 0, 0, 10%);
  animation: pulse-bg 1s infinite;
}

.card--skeleton .p {
  background-color: rgb(0, 0, 0, 10%);
  height: 24px;
  width: 60%;
  margin-bottom: 25px;
  animation: pulse-bg 1s infinite;
}

</style>
