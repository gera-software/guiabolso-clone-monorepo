<template>
    <button class="fab" type="button">
        <slot>
            icon
        </slot>
    </button>
</template>

<style scoped>
.fab {
    width: 60px;
    height: 60px;
    border-radius: 100%;
    border: none;
    background-color: #F9386A;
    color: white;
    box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
    position: fixed;
    bottom: 25px;
    right: 25px;
    font-size: 18px;
    cursor: pointer;
}
</style>