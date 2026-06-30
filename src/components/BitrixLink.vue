<template>
    <button class="bitrix-link" @click="$emit('click')">
        Битрикс24
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.16666 0.500005H10.5L10.5 3.83334M10.5 0.500005L5.5 5.5M4.38889 0.5H3.16667C2.23325 0.5 1.76654 0.5 1.41002 0.681656C1.09641 0.841445 0.841445 1.09641 0.681656 1.41002C0.5 1.76654 0.5 2.23325 0.5 3.16667V7.83333C0.5 8.76675 0.5 9.23347 0.681656 9.58998C0.841445 9.90359 1.09641 10.1586 1.41002 10.3183C1.76654 10.5 2.23325 10.5 3.16667 10.5H7.83333C8.76675 10.5 9.23347 10.5 9.58998 10.3183C9.90359 10.1586 10.1586 9.90359 10.3183 9.58998C10.5 9.23347 10.5 8.76675 10.5 7.83333V6.61111"
                stroke="#636363" stroke-linecap="round" stroke-linejoin="round" />
        </svg>        
    </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.bitrix-link {
    display: flex;
    align-items: center;
    padding: 4px 6px 4px 4px;
    gap: 6px;
    border: 1px solid #B6B6B5;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #636363;
    transition: 0.2s;
}

.bitrix-link:hover {
    background: #f0f0ee;
}

.bitrix-icon {
    flex-shrink: 0;
}
</style>