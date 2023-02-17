<template>
  <div class="app-bar">
    <div class="container">
      <slot name="button">
        <BackButton v-if="!hideBackButton"/>
      </slot>
      <div class="content">
          <slot>
              <h1>{{title}}</h1>
          </slot>
      </div>
    </div>
 
    <slot name="extra">
    </slot>
  </div>
</template>

<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'

defineProps<{
    title?: String
    hideBackButton?: Boolean
}>()
</script>

<style scoped>
.app-bar {
  background-color: white;
  box-shadow: 0px 3px 4px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  /* justify-content: flex-start;
  align-items: center; */
  /* padding: 15px 20px; */
  position: fixed;
  top: 0;
  width: 100dvw;
  z-index: 2;
}

.app-bar .back-icon {
  margin-right: 40px;
}

.app-bar .container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 15px 20px;
}

.app-bar .content {
    display: flex;
}

.app-bar h1 {
  margin: 0;
  font-weight: 600;
  font-size: 22px;
  color: #404040;
}


</style>