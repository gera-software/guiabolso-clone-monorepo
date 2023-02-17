<template>
    <div class="category-select" @click="openModal">
        <CategoryIcon :icon="selected?.iconName ?? 'Uncategorized'" :color="selected?.primaryColor ?? '#F9386A'" />
        <span>{{selected?.name ?? 'Categorizar'}}</span>
    </div>

    <Teleport to="body">
        <Transition name="fade">
            <div v-if="open" class="modal modal--fullscreen">
                <div class="page">
                    <AppBar title="Categorias">
                        <template v-slot:button>
                            <button @click="closeModal" class="back-icon">
                                <font-awesome-icon icon="fa-solid fa-arrow-left-long" />
                            </button>
                        </template>
                    </AppBar>
                    <div class="container">
                        <div v-for="(catGroup, key) in categoriesByGroup">
                            <h2 class="category-group">{{key}}</h2>
                            <ul class="category-list">
                                <li v-for="category in catGroup">
                                    <div class="category" @click="handleSelect(category)">
                                        <CategoryIcon :icon="category?.iconName ?? 'Uncategorized'" :color="category?.primaryColor ?? '#F9386A'" />
                                        <span>{{category.name}}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppBar from '@/components/AppBar.vue'
import { Category } from '../config/types';
import api from '../config/axios.js'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { groupBy } from 'lodash'

const props = defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

function openModal() {
    open.value = true
}

function closeModal() {
    open.value = false
}

const categories = ref<Category[]>([])

const categoriesByGroup = computed(() => {
  return groupBy(categories.value, (category) => category.group)
})

async function getCategories(): Promise<Category[]> {
  return api.guiabolsoApi({
    method: 'get',
    url: `/categories-fetch`,
  }).then(function (response) {
    //   console.log(response.data)
      categories.value = response.data
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
    await getCategories()
    selected.value = categories.value.find(category => category._id == props.modelValue)
})

const selected = ref<Category>()

function handleSelect(category: Category) {
    selected.value = category
    emit('update:modelValue', selected.value._id)
    closeModal()
}
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  background-color: white;
  overflow-y: auto;
}

.modal--fullscreen {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.back-icon {
  color: #F9386A;
  margin-right: 40px;
  padding: 0;
  font-size: 16px;
  height: 16px;
  border: none;
  background-color: transparent;
}

.container {
  padding-top: 60px;
}

.category-group {
    color: #707070;
    font-size: 16px;
    font-weight: 600;
    margin: 30px 15px 10px 15px;
}

.category-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.category-list li {
    margin: 5px 0;
}

.category-select,
.category {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    cursor: pointer;
    font-size: 20px;
}

.category:hover {
    background-color: #0000000f;
}

.category-select {
    border-bottom: 1px solid black;
    padding: 8px 0;
}
</style>