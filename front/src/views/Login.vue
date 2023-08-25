<template>
  <div class="login-container">
    <img id="yiyong-image" src="../assets/login/yiyong.png">
    <p id="Copyright">Copyright©2022</p>
    <img id="yiyong-logo" src="../assets/login/yiyong-logo.png">
    <p id ="firm">北京易用联友科技有限公司 Inc.All Ringhts Reserved</p>
    <div class="input-container">
      <img id="input-container-back" src="../assets/login/input-container-back.png">
      <img id="welcome-login" src="../assets/login/welcome-login.png">
      <div class="username">
        <img src="../assets/login/user.png" id="user">
        <input
            type="text"
            v-model="username"
            placeholder="用户名"
            id="username"
            style="height: 100%; font-size: 16px"
        />
      </div>
      <div class="password">
        <img src="../assets/login/密码.png" id="passwd">
        <input
            type="text"
            v-model="password"
            placeholder="密码"
            id="password"
            style="height: 100%; font-size: 16px"
        />
      </div>
      <div class="key">
        <img src="../assets/login/yanzhengma%20(2).png" id="key">
        <input
            type="text"
            v-model="key"
            placeholder="验证码"
            id="keyinput"
            style="height: 100%; font-size: 16px"
        />
        <div id="fetch" @click="getKey" style="padding: 4.4%; color: #5E2EFF;">
          获取验证码
        </div>
      </div>
      <div id="remember"  @click="toggleRememberMe">
        <img id="false" v-if="!rememberMe" src="../assets/login/椭圆%201%20拷贝.png"  />
        <img id="true" v-else src="../assets/login/椭圆%201.png" />
      </div>
      <div id="text" @click="toggleRememberMe">记住密码</div>
      <button @click="login" style="font-size: 18px; cursor: pointer">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data(){
    return{
      username: '',
      password: '',
      key: '',
      rememberMe: false,
    }
  },
  mounted() {
    // 在组件挂载时从本地存储中获取记住密码信息
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe');

    if (savedRememberMe === 'true') {
      this.rememberMe = true;
      this.username = savedUsername;
      this.password = savedPassword;
    }
  },
  methods:{
    getKey(){

    },
    login() {
      // 执行登录操作
      this.$router.push('/')
      // 如果记住密码，保存用户名和密码到本地存储
      if (this.rememberMe) {
        localStorage.setItem('username', this.username);
        localStorage.setItem('password', this.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // 不记住密码，清除本地存储的信息
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
    },
    toggleRememberMe() {
      this.rememberMe = !this.rememberMe;
    },
  }
}
</script>

<style scoped>
*{

  margin:0;

  padding:0

}
html, body {
  font-size: 16px;
}
.login-container {
  position: relative;
  background-image: url('../assets/login/background@2x.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100vh;
}
#yiyong-image {
  width: 48.6%;
  height: 11.2%;
  margin-top: 6.5%;
  margin-left: 5.7%;
}
#Copyright{
  position: absolute;
  left: 32.8%;
  top: 92%;
  width: 7.4%;
  height: 1.67%;
  font-size: 80%;
  font-family: Arial,serif;
  font-weight: 400;
  color: #6E6E6E;
  line-height: 4.1%;
  margin-right:auto;
}
#yiyong-logo{
  position: absolute;
  left: 40.6%;
  top: 90.8%;
  width: 2.5%;
  height: 2.59%;
}
#firm{
  position: absolute;
  left: 43.6%;
  top: 92%;
  width: 43.6%;
  height: 1.76%;
  font-size: 75%;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: #6E6E6E;
  line-height: 4.1%;
  margin-right:auto;
}
.input-container{
  position: absolute;
  left: 60.9%;
  top: 23.6%;
  width: 27%;
  height: 48%;

}
.input-container button{
  position: absolute;
  left: 12.7%;
  top: 76.1%;
  width: 74.4%;
  height: 12.9%;
  background: #5E2EFF;
  border-radius: 7px;
  color: white;
}
#input-container-back{
  position: relative;
  top: 0; /* 与容器边框顶部对齐 */
  left: 0; /* 与容器边框左侧对齐 */
  width: 100%;
  height: 100%;
}
#welcome-login{
  position: absolute;
  top: 9.4%;
  left: 12.7%;
  width: 28.5%;
  height: 5%;
}
.username{
  position: absolute;
  top: 21.9%;
  left: 12.7%;
  width: 74.4%;
  height: 12%;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
}
.username #user{
  position: relative;
  width: 6%;
  height: 40%;
  top: 10%;
  left: 5%;
  z-index: 1;
}
.username input{
  position: relative;
  top: 0%;
  left: 10%;
  width: 70%;
  height: 100%;
  outline: none;
  border:0px;
}
.username input::placeholder{
  width: 62px;
  height: 20px;
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: #9A9A9A;
  line-height: 71px;
}
.password{
  position: absolute;
  top: 37%;
  left: 12.7%;
  width: 74.4%;
  height: 12%;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
}
.password #passwd{
  position: relative;
  width: 6%;
  height: 40%;
  top: 10%;
  left: 5%;
  z-index: 1;
}
.password input{
  position: relative;
  top: 0%;
  left: 10%;
  width: 70%;
  height: 100%;
  outline: none;
  border:0px;
}
.password input::placeholder{
  width: 62px;
  height: 20px;
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: #9A9A9A;
  line-height: 71px;
}
.key {
  position: absolute;
  top: 52%;
  left: 12.7%;
  width: 74.4%;
  height: 12%;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
  display: flex;
}
.key #key{
  position: relative;
  width: 6%;
  height: 40%;
  top: 30%;
  left: 5%;
  z-index: 1;
}
.key #keyinput{
  position: relative;
  top: 0%;
  left: 10%;
  width: 50%;
  height: 100%;
  outline: none;
  border:0px;
}
.key #keyinput::placeholder{
  width: 62px;
  height: 20px;
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: #9A9A9A;
  line-height: 71px;
}
.key #fetch{
  position: relative;
  cursor: pointer;
  top: -1%;
  left: 5%;
  width: 30%;
  height: 47%;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
}
.input-container #remember{
  position: absolute;
  top: 68%;
  left: 13%;
  cursor: pointer;
}
.input-container #text{
  position: absolute;
  top: 68%;
  left: 24%;
  font-size: 14px;
  cursor: pointer;
  color: #5E2EFF;
}
</style>
