<script setup>
import { computed } from 'vue';
import LeadsInfoDrawer from './LeadsInfoDrawer.vue';
</script>

<template>
	<leads-info-drawer v-bind="$attrs" biz-type="opportunity" />
</template>
