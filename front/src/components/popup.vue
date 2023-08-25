<template>
  <div id="kefu" @mousedown="arrowMove" @mouseup="resetDragging"> <!--客服按钮，可拖动-->
    <div id="kefuButton" @click="handleButtonClick"></div>
  </div>
  <div v-if="isPopupVisible&&pageId===1" id="popUp"> <!--客服小窗口第一个界面，对话界面-->
    <div id="popup-content">
      <div id="top"> <!--客服小窗口顶部界面-->
        <div id="topText">
          小智客服为您服务
        </div>
        <div id="settings" @click="pageId=2">
          设置/帮助
        </div>
        <div id="close" @click="closeChatWindow">
          ×
        </div>
      </div>
      <div id="textBox" ref="scrollDiv"> <!--客服小窗口对话界面，和主对话界面基本一致-->
        <div id="AIChat">
          <img :src="AIImgComputed" style="width:18px;height:18px;">
          <div id="AIChatBlock">{{ textWelcome }}</div>
        </div>
        <div v-for="textSet in chatText" id="chatTextBox">
          <div id="UserChat">
            <div id="UserChatBlock">
              {{ textSet[0] }}
            </div>
            <img :src="userImgComputed" style="width:18px;height:18px;">
          </div>
          <div id="AIChat">
            <img :src="AIImgComputed" style="width:18px;height:18px;">
            <div id="AIChatBlock">{{ textSet[1] }}</div>
          </div>
        </div>
        <div id="UserChat" v-if="loading===true">
          <div id="UserChatBlock">
            {{ asked }}
          </div>
          <img :src="userImgComputed" style="width:18px;height:18px;">
        </div>
        <div id="AIChat" v-if="loading===true">
          <img :src="AIImgComputed" style="width:18px;height:18px;">
          <div id="AIChatBlock2">
            <div id="chatBlockLoading"><loading></loading></div>
          </div>
        </div>
      </div>
      <div id="clear"><img src="../assets/删除.png" @click="deleteData" style="width: 24px;height: 24px;">
        <div style="position:relative;top:1.4%;left:0.3%">删除会话</div> <!--删除对话按钮，用于清除客服窗口内的对话-->
      </div>
      <div id="inputBox"> <!--客服界面输入框-->
        <input type="text" v-model="inputData" v-on:keydown.enter="sendData" id="input" placeholder="请输入提问内容，按回车或点击发送进行提交"/>
        <img src="../assets/组 5872.png" @click="sendData" style="width: 24px;height: 24px;" id="send">
      </div>
    </div>
  </div>
  <div v-if="isPopupVisible&&pageId===2" id="popUp"> <!--客服小窗口第二个界面，反馈问题界面-->
    <div id="popup-content">
      <div id="top">
        <div id="settings2">
          设置/帮助
        </div>
        <div id="close2" @click="closeChatWindow">
          ×
        </div>
      </div>
      <div id="textBox2" @click="pageId=1">
        跳转前端对话UI
      </div>
      <div id="inputBox2">
        <textarea type="text" v-model="submitData" v-on:keydown.enter="submit" id="input" placeholder="请输入你要反馈的问题，按回车或点击发送进行提交" style="vertical-align: top;"/>
        <div id="button" @click="submit">提交问题</div>
      </div>
    </div>
  </div>
  <!-- 使用 v-if 控制弹出窗口的显示与隐藏 -->

</template>

<script>
import axios from 'axios';
import loading from './loading.vue';
import userWindowImg from "../assets/用户.png"
import AIWindowImg from "../assets/组 5906.png"
export default {
  components: {
    loading
  },
  data() {
    return {
      isPopupVisible: false, //小窗口是否显示
      loading: false, //模型是否正在加载
      chatText: [] , //对话内容
      inputData: '', //用户输入的问题
      apiUrl: '/api/get-answer', //获取回答的api
      pageId: 1, //当前小窗口显示的页面ID
      submitData:'', //用户反馈的问题
      dragTime: 0, //拖动小窗口的时间
      textWelcome: '欢迎使用 易用医工知识对话模型 Web UI！',
      asked: '' //储存用户上一次问的问题
    };
  },
  methods: {
    openChatWindow() { //打开小窗口
      this.isPopupVisible = true;
    },
    closeChatWindow() { //关闭小窗口
      this.isPopupVisible = false;
    },
    handleButtonClick() { //点击窗口响应时间
      if (this.dragTime < 115) {
        // 如果没有拖动（拖动时间小于115ms），则执行点击事件逻辑，若窗口未开启则开启窗口，否则关闭
        if(this.isPopupVisible === false){
          this.openChatWindow();
        }
        else{
          this.closeChatWindow();
        }
      }
    },
    arrowMove(e) { // 拖拽设备域
      this.dragTime = new Date().getTime() //记录拖动开始时间
      // 元素大小
      let elW = e.currentTarget.offsetWidth
      let elH = e.currentTarget.offsetHeight
      // 元素位置
      let elL = e.currentTarget.offsetLeft
      let elT = e.currentTarget.offsetTop
      // 鼠标位置
      let x = e.clientX
      let y = e.clientY
      // 窗口大小
      let w = window.innerWidth
      let h = window.innerHeight
      // 鼠标到元素左边距离
      let moveX = x - elL
      let moveY = y - elT
      let el = e.currentTarget
      document.onmousemove = function (e) {
        el.style.left = e.clientX - moveX + 'px'
        el.style.top = e.clientY - moveY + 'px'
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    resetDragging(){ //拖动结束时计算拖动总时间
      var endTime = new Date().getTime()
      this.dragTime = endTime - this.dragTime
      // this.isDragging = false
    },
    sendData(){ //和主界面的sendData函数基本相同
      if(this.inputData === ''){
        window.alert('请输入相关内容')
        return
      }
      if(this.loading === true){
        window.alert('模型正在回答中，请稍等')
        return
      }
      var input = this.inputData
      this.asked = input
      this.inputData = ''
      this.loading = true
      axios.post(this.apiUrl, {quest: input, history:this.chatText})
          .then(response =>{
            var chatSet = []
            chatSet.push(input)
            chatSet.push(response.data.response)
            this.chatText.push(chatSet)
            this.loading = false
            this.scrollToBottom()
          })
          .catch(error =>{
            window.alert("发生错误")
            this.loading = false
            this.scrollToBottom()
          })
      this.scrollToBottom()
    },
    scrollToBottom() {
      // 获取 DOM 元素的引用
      this.$nextTick(() => {
        // dom 元素更新后执行滚动条到底部 否则不生效
        let scrollElem = this.$refs.scrollDiv;
        scrollElem.scrollTo({
          top: scrollElem.scrollHeight,
          behavior: 'smooth'
        });
      });
    },
    submit(){ //用户提交反馈函数，该函数目前并没有实际功能，需要后续补充
      window.alert('提交成功')
      this.submitData = ''
    },
    deleteData(){ //清空对话数据
      this.chatText = []
    },
    saveAIImg(){ //缓存图片，同主对话界面
      let url = localStorage.getItem(AIWindowImg);
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = AIWindowImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(AIWindowImg,dataUrl);  // 缓存图片
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return AIWindowImg;
      }
    },
    saveUserImg(){
      let url = localStorage.getItem(userWindowImg);
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = userWindowImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(userWindowImg,dataUrl);  // 缓存图片
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return userWindowImg;
      }
    },
    loadImages() {
      this.AIImgUrl = this.saveAIImg();
      this.userImgUrl = this.saveUserImg();
    },
  },
  created(){
    this.loadImages()
  },
  computed:{
    AIImgComputed(){
      return this.saveAIImg()
    },
    userImgComputed(){
      return this.saveUserImg()
    },
  }
};
</script>

<style>
#kefu {
  z-index: 40;
  position: fixed;
  top: 75%;
  cursor: pointer;
  right: 33px;
  width: 89px;
  height: 89px;
  background: url('../assets/组 5922.png');
  border-radius: 50%;
}
#kefuButton {
  width: 100%;
  height:100%;
}
#popUp{
  width: 28%;
  height: 65%;
  position: fixed;
  top: 20%;
  left: 62%;
  background: #FFFFFF;
  box-shadow: 0px 3px 6px 1px rgba(0,0,0,0.16);
  border-radius: 15px 15px 15px 15px;
  opacity: 1;
  border: 1px solid #A2A2A2;
}
#popUp #popup-content{
  width:100%;
  height: 100%;
}
#popup-content #top {
  width:94%;
  height:4%;
  padding:3%;
  position:relative;
  border-radius: 15px 15px 0px 0px;
  background: #1E82FE;
  z-index: 50;
  display:flex;
}
#popup-content #top #topText{
  font-size: 16px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  position:relative;
}
#loading{
  position:relative;
  width: 68.2%;
  height: 82%;
  top: 6%;
  left:27%;
  z-index:100;
}
#popup-content #top #settings{
  font-size: 16px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  position:relative;
  left:35%;
  cursor: pointer;
}
#popup-content #top #settings2{
  font-size: 16px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  position:relative;
  left:40%;
}
#popup-content #top #close{
  font-size: 16px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  position:fixed;
  left:88%;
  cursor: pointer;
}
#popup-content #top #close2{
  font-size: 16px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  position:fixed;
  left:88%;
  cursor: pointer;
}
#popup-content #textBox{
  width:100%;
  height:82%;
  position: relative;
  background: #FFFFFF;
  overflow:auto;
}
#popup-content #textBox2{
  width: 80%;
  height: 5%;
  position: relative;
  cursor:pointer;
  top: 5%;
  left:8%;
  background: linear-gradient(180deg, #FFFFFF 0%, #D8F3FF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
  font-size: 16px;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #1E82FE;
  text-align: center;
  padding:3%;

}
#popup-content #textBox #chatTextBox{
  width:100%;
}
#popup-content #textBox #AIChat{
  width:94%;
  display:flex;
  position:relative;
  margin:3%;
}
#popup-content #textBox #AIChat #AIChatBlock{
  width:78.2%;
  left:3%;
  position: relative;
  padding:2%;
  background: #F9FAFB;
  border-radius: 0px 25px 25px 25px;
  opacity: 1;
  border: 1px solid #E5E0FB;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #4B4B4B;
}
#popup-content #textBox #AIChat #AIChatBlock2{
  width:78.2%;
  left:3%;
  position: relative;
  display:flex;
}
#popup-content #textBox #AIChat #AIChatBlock2 #chatBlockLoading{
  width:30%;
  height:400%;
  left:2%;
  top:0%;
  position: relative;
}
#popup-content #textBox #UserChat{
  width:94%;
  display:flex;
  justify-content: flex-end;
  margin:3%;
}
#popup-content #textBox #UserChat #UserChatBlock{
  width:78.2%;
  right:3%;
  padding:2%;
  position: relative;
  background: #1E82FE;;
  border-radius: 25px 0px 25px 25px;
  opacity: 1;
  border: 1px solid #2771F9;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #4B4B4B;
}
#clear{
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
  line-height: 0px;
  font-size: 14px;
  display: flex;
  position:fixed;
  left: 83%;
  top:75%;
  z-index:20;
  width:100%;
  height:100%;
  cursor: pointer;
}
#inputBox{
  width: 100%;
  height: 9%;
}

#inputBox #input{
  width:93%;
  height:60%;
  position:relative;
  top:0%;
  left:3%;
  background: linear-gradient(180deg, #EDE9F9 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
}
#inputBox #send{
  cursor: pointer;
  position:relative;
  top:-60%;
  left:90%;
  z-index: 20;
}
#inputBox2{
  width:100%;
  height:80%;
}
#inputBox2 #input{
  width:84%;
  height:73%;
  position:relative;
  top:10%;
  left:7%;
  background: linear-gradient(180deg, #EDE9F9 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  padding:2%;
  border: 1px solid #CECECE;
}
#inputBox2 #button{
  width: 16%;
  height:5%;
  background: #1E82FE;
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #1E82FE;
  position:relative;
  top:11%;
  left:75%;
  padding:3%;
  text-align: center;
  cursor: pointer;
}
</style>
