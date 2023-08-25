<template>
  <div id="top">
  </div>
  <div id="left">
    <manageButton
        @custom_event="handleCustomEvent"
        :chatList="chatTextList"
        @addChat="handleAddChat"
        @deleteChat="handleDeleteChat"
        @changeTitle="handleTitleChange"
        :chatId="chatId"
        @deleteAll="handleDeleteAll"
        @quickAsk="handleQuickAsk"
        :loading="loading"
        :Score="Score"
        :contentNum="contentNum"
        :selectedValue="selectedValue"
        :isEnableContext="isEnableContext"
        :isEnablePrompt="isEnablePrompt"
        :currentPrompt="currentPrompt"
        @update-score="updateScore"
        @update-content-num="updateContentNum"
        @update-context="updateContext"
        @update-enable-prompt="updateEnablePrompt"
        @update-current-prompt="updateCurrentPrompt"
    />
  </div>
  <div id="right">
    <div id="chatText" ref="scrollDiv" updated>
      <div v-if="chatTextList.length!==0" id="chatTextBox">
        <div id="AIChat" v-if="chatId!==-1">
          <img :src="saveAIImg()" style="width:48px;height:48px;">
          <div id="AIChatBlock">
            {{ textWelcome }}
          </div>
        </div>
        <div v-if="chatId!==-1" v-for="(textSet, index) in chat.chatText" id="chatTextList">
          <div id="UserChat">
            <div id="UserChatBlock">
              {{ textSet[0] }}
            </div>
            <img :src="saveUserImg()" style="width:48px;height:48px;">
          </div>
          <div id="AIChat">
            <img :src="saveAIImg()" style="width:48px;height:48px;">
            <div id="AIChatBlock">
              {{ textSet[1] }}<br>
              <div id="copy"
                   style="position:relative;
                            display:flex;
                            left:70%;
                            top:4%;
                            font-size: 14px;
                            font-family: PingFang SC-Regular, PingFang SC;
                            font-weight: 400;
                            color: #666666;">
                <img :src="saveCopyImg()" @click="copyToClipboard(textSet[1])" style="cursor:pointer"> &nbsp;&nbsp;复制&nbsp;&nbsp;&nbsp;&nbsp;
                <div v-if="chat.isHelp[index]===-1" style="display:flex">
                  <img :src="saveIsHelpImg()" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="saveIsUnHelpImg()" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div v-if="chat.isHelp[index]===1" style="display:flex">
                  <img :src="saveHelpSuccessImg()" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="saveIsUnHelpImg()" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div v-if="chat.isHelp[index]===2" style="display:flex">
                  <img :src="saveIsHelpImg()" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="saveUnHelpSuccessImg()" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="UserChat" v-if="chatId!==-1&&loading===true">
          <div id="UserChatBlock">
            {{ asked }}
          </div>
          <img src="../assets/组 5926.png" style="width:48px;height:48px;">
        </div>
        <div id="AIChat" v-if="chatId!==-1&&loading===true">
          <img src="../assets/组 5892.png" style="width:48px;height:48px;">
          <div id="AIChatBlock2">
            <div id="chatBlockLoading"><loading></loading></div>
          </div>
        </div>
        <button v-if="chatId!==-1&&chat.chatText.length!==0&&loading===false" @click="reAsk" id="reAsk">重新提问</button>
        <div v-if="chatId!==-1&&chat.chatText.length!==0&&loading===false" v-for="(fastAskItem, index) in fastAskList" id="fastAskBox" @click="fastAsk(index)">
          <img src="../assets/矩形 1813.png" style="width:18px;height:18px;" id="fastAskLeft">&nbsp;&nbsp;&nbsp;&nbsp;            <img src="../assets/矩形 1813.png" style="width:18px;height:18px;" id="fastAskLeft">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div id="fastAskText">{{fastAskItem}}</div>
          <img src="../assets/箭头.png" style="width:18px;height:18px;" v-if="chatId!==-1" id="fastAskArrow">
        </div>
        <div id="padding"></div>
      </div>
    </div>
    <div id="divider"></div>
    <div id="inputBox">
      <input type="text" v-model="inputData" v-on:keydown.enter="sendAdjustData" id="input" placeholder="请输入提问内容，按回车或点击发送进行提交"/>
      <img src="../assets/组 5872.png" @click="sendAdjustData" style="width: 24px;height: 24px;" id="sendData">
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import manageButton from '../components/manageButton.vue';
import loading from '../components/loading.vue';
import popUp from '../components/popup.vue'
import AIImg from "../assets/组 5892.png"
import userImg from "../assets/组 5926.png"
import copyImg from "../assets/复制.png"
import isHelpImg from "../assets/路径 2984.png"
import isUnHelpImg from "../assets/路径 2983.png"
import helpSuccessImg from "../assets/点赞成功.png"
import unHelpSuccessImg from "../assets/点踩成功.png"
export default {
  components:{
    manageButton,
    loading,
    popUp
  },
  data(){
    return{
      Score:500,
      contentNum:5,
      selectedValue: 0,
      isEnableContext: false,
      isEnablePrompt: false,
      currentPrompt: '',
      chatId:0,
      inputData: '',
      textWelcome: '欢迎使用 易用医工知识对话模型 Web UI！',
      // chatTextList: [{
      //   title:'New Chat', //对话标题
      //   chatText:[['什么是呼吸机','呼吸机是一种能够起到预防和治疗呼吸衰竭，减少并发症，挽救及延长病人生命的至关重要的医疗设备。']],
      //   isHelp:[-1],
      // },],
      chatTextList:  JSON.parse(localStorage.getItem('chat')) || [],
      chat:{
        title:'New Chat',
        chatText:[],
        isHelp:[]
      },
      fastAskList:['什么是除颤仪','什么是呼吸机','什么是心电图仪器'],
      isError: false,
      apiUrl: '/api/get-answer',
      loading: false,
      asked:'',
    };
  },
  methods:{
    // 子组件传递修改的参数
    updateScore(score) {
      this.Score = score;
    },
    updateContentNum(value) {
      this.contentNum = value;
    },
    updateContext(value) {
      this.isEnableContext = value;
    },
    updateEnablePrompt(value){
      this.isEnablePrompt = value;
    },
    updateCurrentPrompt(value) {
      this.currentPrompt = value;
    },
    // 发送问题
    sendAdjustData() {
      if(this.inputData === ''){
        window.alert('请输入相关内容')
        return
      }
      if(this.loading === true){
        window.alert('模型正在回答中，请稍等')
        return
      }
      if((this.chatId === 0)&&(this.chatTextList.length === 0)){
        var newChat = {
          title:'New Chat',
          chatText:[],
          isHelp:[]
        }
        this.textColor = Array(this.chatTextList.length).fill("black")
        this.chatTextList.push(newChat)
        this.textColor.push('#6A3DFF')
        this.chatId = 0

      }
      this.loading = true
      this.asked = this.inputData
      this.chat = this.chatTextList[0]
      const requestData = {
        inputData: this.inputData,
        Score: Number(this.Score),
        contentNum: Number(this.contentNum),
        isEnableContext: this.isEnableContext ? 'True' : 'False',
        isEnablePrompt: this.isEnablePrompt ? 'True' : 'False',
        currentPrompt: this.currentPrompt,
        history:this.chat.chatText
      };
      console.log(this.Score)
      console.log(this.contentNum)
      console.log(this.isEnablePrompt)
      console.log(this.currentPrompt)
      console.log(this.chat.chatText)
      axios.post('/api/get-adjust-answer', requestData)
          .then(response => {
            console.log(response)
            let chatSet = []
            chatSet.push(this.inputData)
            chatSet.push(response.data.response)
            this.chat.chatText.push(chatSet)
            this.chat.isHelp.push(-1)
            this.chatTextList[0] = this.chat
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
            this.inputData = ''
            this.isError = false;
            this.scrollToBottom();
            this.loading = false
          })
          .catch(error => {
            window.alert("发生错误")
            this.isError = true;
            this.inputData = ''
            console.error(error)
            this.scrollToBottom();
            this.loading = false
          });

      this.scrollToBottom();
    },
    // 重新提问
    reAsk(){
      var rescentChat = this.chat.chatText.pop()
      var input = rescentChat[0]
      this.asked = input
      this.loading = true
      const requestData = {
        inputData: input,
        Score: Number(this.Score),
        contentNum: Number(this.contentNum),
        isEnableContext: this.isEnableContext ? 'True' : 'False',
        isEnablePrompt: this.isEnablePrompt ? 'True' : 'False',
        currentPrompt: this.currentPrompt,
        history:this.chat.chatText
      };
      axios.post('/api/get-adjust-answer', requestData)
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = input.substring(0,15)
            }
            console.log(response)
            let chatSet = []
            chatSet.push(input)
            chatSet.push(response.data.response)
            this.chat.chatText.push(chatSet)
            let lastIndex = this.chat.isHelp.length - 1
            this.chat.isHelp[lastIndex] = -1
            this.chatTextList[this.chatId] = this.chat
            this.getFastAsk(input)
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
            this.isError = false;
            this.loading = false;
            this.scrollToBottom();
          })
          .catch(error =>{
            window.alert("发生错误")
            this.isError = true;
            this.loading = false
            console.error(error)
            this.scrollToBottom();
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom();
    },
    // 获取快速提问答案
    fastAsk(index){
      this.loading = true
      this.asked = this.fastAskList[index]
      this.chat = this.chatTextList[0]
      const requestData = {
        inputData: this.fastAskList[index],
        Score: Number(this.Score),
        contentNum: Number(this.contentNum),
        isEnableContext: this.isEnableContext ? 'True' : 'False',
        isEnablePrompt: this.isEnablePrompt ? 'True' : 'False',
        currentPrompt: this.currentPrompt,
        history:this.chat.chatText
      };
      axios.post('/api/get-adjust-answer', requestData)
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = this.fastAskList[index].substring(0,15)
            }
            console.log(response)
            let chatSet = []
            chatSet.push(this.fastAskList[index])
            chatSet.push(response.data.response)
            this.chat.chatText.push(chatSet)
            this.chat.isHelp.push(-1)
            this.chatTextList[this.chatId] = this.chat
            let JSONString = JSON.stringify(this.chatTextList)
            this.getFastAsk(this.fastAskList[index])
            localStorage.setItem('chat', JSONString)
            this.loading = false
            this.isError = false;
            this.scrollToBottom();
          })
          .catch(error =>{
            window.alert("发生错误")
            this.isError = true;
            this.loading = false
            console.error(error)
            this.scrollToBottom();
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom();
    },
    // 获取快速提问的问题
    getFastAsk(quest){
      axios.post('/api/fast-ask', {quest: quest})
          .then(response =>{
            console.log(response)
            var list = response.data.response.split('\n')
            for(var i = 0; i < list.length; i++){
              list[i] = list[i].substring(2)
            }
            this.fastAskList = list
            // this.fastAskList = response.data.response.split('\n')
          })
          .catch(error =>{
            window.alert("快速提问发生错误")
            console.error(error)
          })
    },
    handleCustomEvent(dataFromChild) {
      // console.log(dataFromChild)
      this.chat = this.chatTextList[dataFromChild]
      this.chatId = dataFromChild
      this.scrollToBottom();
    },
    handleDeleteChat(dataFromChild){
      this.chatTextList = dataFromChild.chatList
      this.chatId = dataFromChild.chatId
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString)
      if(this.chatTextList.length === 0){
        return
      }
      this.chat = this.chatTextList[dataFromChild.chatId]
      this.scrollToBottom();
    },
    // 删除所有对话记录
    handleDeleteAll(){
      this.chatTextList = []
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString)
      this.chat.chatText = []
      console.log(1)
    },
    scrollToBottom() {
      // 获取 DOM 元素的引用
      this.$nextTick(() => {
        // dom 元素更新后执行滚动条到底部 否则不生效
        let scrollElem = this.$refs.scrollDiv;
        console.log('scrollHeight: ', scrollElem.scrollHeight);
        // scrollElem.scrollTop = scrollElem.scrollHeight
        scrollElem.scrollTo({
          top: scrollElem.scrollHeight,
          behavior: 'smooth'
        });
      });
    },
    updated : function(){
      this.$nextTick(function(){
        var div = document.getElementById('chatText');
        div.scrollTop = div.scrollHeight;
      })
    },
    // 复制功能
    copyToClipboard(text) {
      // 使用Clipboard API写入指定文本到剪贴板
      navigator.clipboard.writeText(text)
          .then(() => {
            window.alert('内容已成功复制到剪贴板');
          })
          .catch((err) => {
            window.alert('复制到剪贴板失败：', err);
          });
    },
    // 将图片在本地缓存
    saveAIImg(){
      let url = localStorage.getItem(AIImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = AIImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(AIImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return AIImg;
      }
    },
    saveUserImg(){
      let url = localStorage.getItem(userImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = userImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(userImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return userImg;
      }
    },
    saveCopyImg(){
      let url = localStorage.getItem(copyImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = copyImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(copyImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return copyImg;
      }
    },
    saveHelpSuccessImg(){
      let url = localStorage.getItem(helpSuccessImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = helpSuccessImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(helpSuccessImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return helpSuccessImg
      }
    },
    saveIsHelpImg(){
      let url = localStorage.getItem(isHelpImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = isHelpImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(isHelpImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return isHelpImg;
      }
    },
    saveIsUnHelpImg(){
      let url = localStorage.getItem(isUnHelpImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = isUnHelpImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(isUnHelpImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return isUnHelpImg;
      }
    },
    saveUnHelpSuccessImg(){
      let url = localStorage.getItem(unHelpSuccessImg);
      console.log(url)
      if(url){
        console.log('使用了本地缓存的图片...')
        return url;
      }else{
        console.log('未缓存图片,延迟下载并缓存...')
        setTimeout(function(){
          var img = new Image();
          img.src = unHelpSuccessImg
          console.log(img.src)
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(unHelpSuccessImg,dataUrl);  // 缓存图片
            console.log('加载图片成功...');
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return unHelpSuccessImg
      }
    },
  },
}
</script>

<style scoped>
#top{
  background: url("../assets/ConManage/top6.png");
  background-repeat: no-repeat;
  background-size: 100% 13%;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
}
#left{
  width: 28.5%;
  height: 87%;
  margin: 0px;
  padding: 0px;
  top:13%;
  left:0%;
  position: fixed;
  background: #6F68F7;
  box-shadow: 2px 3px 6px 1px rgba(0,0,0,0.15);
  border-radius: 0px 12px 0px 0px;
  opacity: 1;
  border: 1px solid #ECECEC;
}
#loading{
  position:relative;
  width: 68.2%;
  height: 89.8%;
  top:5%;
  left:25%;
}
#right{
  position:fixed;
  width: 68.2%;
  height: 81.8%;
  top:15%;
  left:30%;
  background: #FFFFFF;
  box-shadow: 2px 3px 6px 1px #A391F8;
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #ECECEC;
}
#right #chatText{
  width:100%;
  height:89.7%;
  overflow-y:auto;
  overflow-x:hidden;
  display:flex;
}
#right #chatText #chatTextBox{
  width:100%;
}
#right #chatText #AIChat{
  width:94%;
  position:relative;
  display:flex;
  margin:3%;
}
#right #chatText #AIChat #AIChatBlock{
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
#right #chatText #UserChat{
  width:94%;
  display:flex;
  justify-content: flex-end;
  margin:3%;
}
#right #chatText #UserChat #UserChatBlock{
  width:78.2%;
  right:3%;
  padding:2%;
  position: relative;
  background: #D9E7FF;
  border-radius: 25px 0px 25px 25px;
  opacity: 1;
  border: 1px solid #2771F9;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #4B4B4B;
}
#right #chatText #reAsk{
  cursor: pointer;
  position:relative;
  margin:2%;
  width:10%;
  height:5%;
  background: white;
  border:1px solid black;
  border-radius: 2px 2px 2px 2px;
  left:42%;
}
#right #chatText #fastAskBox{
  cursor: pointer;
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #78A6FB;
  margin:2%;
  width:80%;
  position:relative;
  left: 7%;
  display:flex;
  padding: 1%;
  font-size: 18px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #4B4B4B;
}
#right #chatText #fastAskBox #fastAskArrow{
  position: absolute;
  right:2%;
  top:30%;
}
#right #chatText #fastAskBox #fastAskLeft{
  position: absolute;
  left:2%;
  top:30%;
}
#right #chatText #padding{
  width:100%;
  height:5%;
}
#right #divider{
  width:100%;
  height: 0%;
  opacity: 1;
  border: 1px solid #6B52D7;
}
#right #inputBox{
  width: 100%;
  height: 11.3%;
}
#right #inputBox #input{
  width:93%;
  height:40%;
  position:relative;
  top:15%;
  left:3%;
  background: linear-gradient(180deg, #EDE9F9 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
}
#right #inputBox #sendData{
  cursor: pointer;
  position:relative;
  top:25%;
  z-index: 20;
}
#right #chatText #AIChat #AIChatBlock2{
  width:78.2%;
  left:3%;
  position: relative;
  display:flex;
}
#right #chatText #AIChat #AIChatBlock2 #chatBlockLoading{
  width:17.5%;
  height:230%;
  left:0%;
  top:0%;
  position: relative;
}
</style>
