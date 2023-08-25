<template>
  <div class="loading"></div>
</template>

<script>
export default {
  name: 'Loading' // 定义的组件名称 使用时写法：loading
}
</script>

<style scoped>

.loading {
  position:relative;
  width: 68.2%;
  height: 81.8%;
  top:0%;
  left:0%;

  background: url('../assets/DM_20230801134420_001.svg') center center no-repeat #fff;


  z-index: 1000;

}

</style>
