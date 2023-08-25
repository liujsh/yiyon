<template>
  <div id="top"> <!--顶部标题-->
  </div>
  <div id="left"> <!--左边的对话切换组件-->
    <changeButton
        @custom_event="handleCustomEvent"
        :chatList="chatTextList"
        @addChat="handleAddChat"
        @deleteChat="handleDeleteChat"
        @changeTitle="handleTitleChange"
        :chatId="chatId"
        @deleteAll="handleDeleteAll"
        @quickAsk="handleQuickAsk"
        :loading="loading"
    />
  </div>
  <div id="right"> <!--右边的对话界面-->
    <div id="chatText" ref="scrollDiv" updated>
      <div v-if="chatTextList.length!==0" id="chatTextBox">
        <div id="AIChat" v-if="chatId!==-1">
          <img :src="AIImgComputed" style="width:48px;height:48px;"> <!-- ...ImgComputed是从缓存中加载本地图片用的 -->
          <div id="AIChatBlock">
            {{ textWelcome }}      <!-- ...每个对话的AI开头欢迎语句 -->
          </div>
        </div>
        <div v-if="chatId!==-1" v-for="(textSet, index) in chat.chatText" id="chatTextList"> <!--对话内容-->
          <div id="UserChat"> <!--用户的对话内容-->
            <div id="UserChatBlock">
              {{ textSet[0] }}
            </div>
            <img :src="userImgComputed" style="width:48px;height:48px;">
          </div>
          <div id="AIChat">   <!--AI的对话内容-->
            <img :src="AIImgComputed" style="width:48px;height:48px;">
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
                <img :src="copyImgComputed" @click="copyToClipboard(textSet[1])" style="cursor:pointer"> &nbsp;&nbsp;复制&nbsp;&nbsp;&nbsp;&nbsp;
                <div v-if="chat.isHelp[index]===-1" style="display:flex">
                  <img :src="isHelpImgComputed" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="isUnHelpImgComputed" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div v-if="chat.isHelp[index]===1" style="display:flex">
                  <img :src="helpSuccessImgComputed" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="isUnHelpImgComputed" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div v-if="chat.isHelp[index]===2" style="display:flex">
                  <img :src="isHelpImgComputed" @click="chat.isHelp[index]=1" style="cursor:pointer"> &nbsp;&nbsp;有帮助&nbsp;&nbsp;&nbsp;&nbsp;
                  <img :src="unHelpSuccessImgComputed" @click="chat.isHelp[index]=2" style="cursor:pointer"> &nbsp;&nbsp;没帮助&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="UserChat" v-if="chatId!==-1&&loading===true">  <!--当AI正在加载回答时才会显示，这是用户问的问题-->
          <div id="UserChatBlock">
            {{ asked }}
          </div>
          <img src="../assets/组 5926.png" style="width:48px;height:48px;">
        </div>
        <div id="AIChat" v-if="chatId!==-1&&loading===true">   <!--当AI正在加载回答时才会显示，这是AI加载界面-->
          <img src="../assets/组 5892.png" style="width:48px;height:48px;">
          <div id="AIChatBlock2">
            <div id="chatBlockLoading"><loading></loading></div>
          </div>
        </div>
        <button v-if="chatId!==-1&&chat.chatText.length!==0&&loading===false" @click="reAsk" id="reAsk">重新提问</button> <!--重新提问按钮-->
        <div v-if="chatId!==-1&&chat.chatText.length!==0&&loading===false" v-for="(fastAskItem, index) in fastAskList" id="fastAskBox" @click="fastAsk(index)"><!--快速提问按钮，共3个-->
          <img src="../assets/矩形 1813.png" style="width:18px;height:18px;" id="fastAskLeft">&nbsp;&nbsp;&nbsp;&nbsp;            <img src="../assets/矩形 1813.png" style="width:18px;height:18px;" id="fastAskLeft">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div id="fastAskText">{{fastAskItem}}</div>
          <img src="../assets/箭头.png" style="width:18px;height:18px;" v-if="chatId!==-1" id="fastAskArrow">
        </div>
        <div id="padding"></div> <!--使快速提问模块和底部保存一段距离-->
      </div>
    </div>
    <div id="divider"></div> <!--分割线-->
    <div id="inputBox"> <!--用户输入问题的模块-->
      <input type="text" v-model="inputData" v-on:keydown.enter="sendData" id="input" placeholder="请输入提问内容，按回车或点击发送进行提交"/>
      <img src="../assets/组 5872.png" @click="sendData" style="width: 24px;height: 24px;" id="sendData">
    </div>
  </div>
  <!--小窗口组件-->
  <popUp></popUp>
</template>

<script>
import axios from 'axios';
import changeButton from '../components/changeButton.vue';
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
    changeButton,
    loading,
    popUp,
  },
  data(){
    return{
      chatId:-1, //当前对话id
      inputData: '', //用户输入内容
      textWelcome: '欢迎使用 易用医工知识对话模型 Web UI！',
      chatTextList: JSON.parse(localStorage.getItem('chat')) || [], //存储对话的数组
      chat:{
        title:'New Chat', //对话标题
        chatText:[], //对话内容
        isHelp:[], //对应的AI回答是否有帮助，用户没有点就是-1， 用户点了有帮助就是0，用户点了没帮助就是2
      }, //当前对话信息
      fastAskList:['什么是除颤仪','什么是呼吸机','什么是心电图仪器'], //快速提问的三个问题
      apiUrl: '/api/get-answer', //获取AI回答的URL
      loading: false, //是否正在加载
      asked:'', //用于保存用户刚刚问的问题
    };
  },
  methods:{
    sendData(){  //向后端发送问题请求回答
      if(this.inputData === ''){ //输入不能为空
        window.alert('请输入相关内容')
        return
      }
      if(this.loading === true){ //模型回答时不能发送问题
        window.alert('模型正在回答中，请稍等')
        return
      }
      if(this.chatId === -1){ //如果当前没有选定对话，就新创建一个对话
        var newChat = {
          title:'New Chat',
          chatText:[],
          isHelp:[],
        }
        this.chatTextList.push(newChat)
        this.chatId = 0
        this.chat = this.chatTextList[0]
      }
      var input = this.inputData
      this.asked = this.inputData //储存用户问的问题，作为加载时的展示内容，因为随后输入框的内容要清空
      this.inputData = ''
      this.loading = true
      axios.post(this.apiUrl, {quest: input, history:this.chat.chatText})
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = input.substring(0,15) //标题长度不超过15字符
            }
            let chatSet = [] //将用户输入的问题和模型的回答组成一个对话组，前后端传输的数据都是这种形式的
            chatSet.push(input) //用户输入的问题
            chatSet.push(response.data.response) //语言模型的回答
            this.chat.chatText.push(chatSet) //将新对话组push到数组中
            this.chat.isHelp.push(-1)
            this.chatTextList[this.chatId] = this.chat //更新数组中储存相应对话信息的内容
            this.getFastAsk(input) //获取快速提问内容
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString) //将储存的对话信息转存到localStorage中
            this.loading = false;
            this.scrollToBottom();
          })
          .catch(error =>{ //若发生错误，则弹出警告窗口，该次对话信息不储存
            window.alert("发生错误")
            console.error(error)
            this.loading = false;
            this.scrollToBottom();
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom(); //将页面滚动到底部
    },
    reAsk(){ //重新提问函数
      var rescentChat = this.chat.chatText.pop() //pop出最后一组对话内容，储存在数组中
      var input = rescentChat[0] //向后端传入的问题，是最后一组对话内容中用户问的问题
      this.asked = input //储存用户问的问题
      this.loading = true
      axios.post(this.apiUrl, {quest: input, history:this.chat.chatText}) //这一块和上面的sendData的相应内容基本相同，不同之处下方会有注释
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = input.substring(0,15)
            }
            let chatSet = []
            chatSet.push(input)
            chatSet.push(response.data.response)
            this.chat.chatText.push(chatSet)
            let lastIndex = this.chat.isHelp.length - 1 //取最后一个元素的地址
            this.chat.isHelp[lastIndex] = -1 //将最后一条消息的isHelp设为-1,即用户未评价是否有帮助
            this.chatTextList[this.chatId] = this.chat
            this.getFastAsk(input)
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
            this.loading = false;
            this.scrollToBottom();
          })
          .catch(error =>{
            window.alert("发生错误")
            this.loading = false
            console.error(error)
            this.scrollToBottom();
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom();
    },
    fastAsk(index){
      this.loading = true
      this.asked = this.fastAskList[index] //快速提问的问题
      axios.post(this.apiUrl, {quest: this.fastAskList[index], history:this.chat.chatText}) //和sendData()相关模块基本相同
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = this.fastAskList[index].substring(0,15)
            }
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
            this.scrollToBottom();
          })
          .catch(error =>{
            window.alert("发生错误")
            this.loading = false
            console.error(error)
            this.scrollToBottom();
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom();
    },
    handleQuickAsk(dataFromChild){ //这是左边栏的快速提问的函数，用于处理子组件的事件，原理和fastAsk基本相同
      this.loading = true
      this.asked = dataFromChild //子组件传来的数据是快速提问的问题
      axios.post(this.apiUrl, {quest: dataFromChild, history:this.chat.chatText}) //和sendData基本一致
          .then(response =>{
            if(this.chat.title === 'New Chat'){
              this.chat.title = dataFromChild.substring(0,15)
            }
            let chatSet = []
            chatSet.push(dataFromChild)
            chatSet.push(response.data.response)
            this.chat.chatText.push(chatSet)
            this.chatTextList[this.chatId] = this.chat
            this.chat.isHelp.push(-1)
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
            this.getFastAsk(dataFromChild)
            this.loading = false
            this.scrollToBottom();
          })
          .catch(error =>{
            window.alert("发生错误")
            this.loading = false
            this.scrollToBottom();
            console.error(error)
            let JSONString = JSON.stringify(this.chatTextList)
            localStorage.setItem('chat', JSONString)
          })
      this.scrollToBottom();
    },
    handleCustomEvent(dataFromChild) { //接收子组件切换对话时传来的信息（切换后的chatId），并修改chatId
      if(this.chatTextList.length===0){
        this.chatId = -1
        return
      }
      this.chat = this.chatTextList[dataFromChild]
      this.chatId = dataFromChild
      this.scrollToBottom();
    },
    getFastAsk(quest){ //获取快速提问问题，后端传来的格式是"1.question1\n2.question2\n3.question3"
      axios.post('/api/fast-ask', {quest: quest})
          .then(response =>{
            var list = response.data.response.split('\n') //分割三个问题
            for(var i = 0; i < list.length; i++){
              list[i] = list[i].substring(2) //将每个问题前面的序号去掉
            }
            this.fastAskList = list
          })
          .catch(error =>{
            window.alert("快速提问发生错误")
            console.error(error)
          })
    },
    handleAddChat(dataFromChild){ //处理子组件添加对话的方法，dataFromChild是添加新对话后的对话列表数组
      this.chatTextList = dataFromChild
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString) //存储localStorage
      this.chatId = dataFromChild.length - 1 //将当前对话切换为的新建对话
      this.chat = dataFromChild[dataFromChild.length - 1] //将当前对话切换为的新建对话
      this.scrollToBottom();
    },
    handleDeleteChat(dataFromChild){ //处理子组件删除对话方法，dataFromChild储存的是对话列表数组和删除对话后的chatId
      this.chatTextList = dataFromChild.chatTextList
      this.chatId = dataFromChild.chatId
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString)
      if(this.chatTextList.length === 0){ //由于对话长度为0时传来的chatId为-1，所以要用这个提前结束函数
        return
      }
      this.chat = this.chatTextList[dataFromChild.chatId]
      this.scrollToBottom();
    },
    handleTitleChange(dataFromChild){ //处理子组件修改标题函数，修改对话列表数组的值即可
      this.chatTextList = dataFromChild
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString)
    },
    handleDeleteAll(dataFromChild){  //处理清空列表方法的函数，修改对话列表数组的值即可
      this.chatTextList = dataFromChild.chatTextList
      let JSONString = JSON.stringify(this.chatTextList)
      localStorage.setItem('chat', JSONString)
      this.chatId = dataFromChild.chatId
      this.chat =  //重置存储当前对话内容的变量
          {
            title:'New Chat',
            chatText:[],
            isHelp:[],
          }
    },
    scrollToBottom() { //滚顶戴底部
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
    copyToClipboard(text) { //将内容复制到剪贴板
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
              window.alert('内容已成功复制到剪贴板');
            })
            .catch(() => {
              window.alert('复制到剪贴板失败');
            });
      } else {
        // 如果浏览器不支持Clipboard API，可以提供一些备选方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('内容已成功复制到剪贴板');
      }
    },
    saveAIImg(){ //缓存图片用，下面的save...函数意义相同
      let url = localStorage.getItem(AIImg);
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = AIImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(AIImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = userImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(userImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = copyImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(copyImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = helpSuccessImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(helpSuccessImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = isHelpImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(isHelpImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = isUnHelpImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(isUnHelpImg,dataUrl);  // 缓存图片
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
      if(url){
        return url;
      }else{
        setTimeout(function(){
          var img = new Image();
          img.src = unHelpSuccessImg
          img.onload = function(){
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.width,img.height);
            var dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(unHelpSuccessImg,dataUrl);  // 缓存图片
          }
          img.onerror = function(){
            console.log('加载图片失败...');
          }
        },10);
        return unHelpSuccessImg
      }
    },
    loadImages() { //缓存所有图片
      this.saveAIImg();
      this.saveUserImg();
      this.saveCopyImg();
      this.saveIsHelpImg();
      this.saveIsUnHelpImg();
      this.saveHelpSuccessImg();
      this.saveUnHelpSuccessImg();
    },
  },
  created(){
    this.loadImages() //缓存所有图片
  },
  computed:{ //防止频繁加载图片影响性能
    AIImgComputed(){
      return this.saveAIImg()
    },
    userImgComputed(){
      return this.saveUserImg()
    },
    copyImgComputed(){
      return this.saveCopyImg()
    },
    isHelpImgComputed(){
      return this.saveIsHelpImg()
    },
    isUnHelpImgComputed(){
      return this.saveIsUnHelpImg()
    },
    helpSuccessImgComputed(){
      return this.saveHelpSuccessImg()
    },
    unHelpSuccessImgComputed(){
      return this.saveUnHelpSuccessImg()
    },
  }
}
</script>

<style scoped>
#top{
  background: url("../assets/top5.png");
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
</style>
