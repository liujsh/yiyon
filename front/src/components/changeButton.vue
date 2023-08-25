<script>
export default {
  emits: ['custom_event','addChat','deleteChat','deleteAll','changeTitle','quickAsk'],
  props: {
    chatList:{
      type: Array,
      required : true,
    },
    chatId:{
      type : Number,
      required : true,
    },
    loading:{
      type : Boolean,
      required: true
    }
  },
  data(){
    return{ //基本和主界面相同，不同的变量在下面有注释
      inputData: '',
      isEditing: Array(this.chatList.length + 1).fill(false), //指示对应栏是否正在修改标题
      chatTextList: this.chatList || [],
      otherQuestions:['什么是除颤仪','什么是呼吸机','什么是心电图仪器'], //左侧快速提问栏位问题，该栏后端尚未开发，因此目前只能用死数据
      textColor: this.initTextColor(this.chatList.length + 1), //指示对应标题栏的颜色，紫色用于指示该对话是否被选中
      chatId: this.chatId,
      apiUrl: 'http://127.0.0.1:5000/get-answer',
      editedTitle: '', //修改的标题
    };
  },
  methods:{
    initTextColor(length){ //初始化颜色（全黑，要多留一个紫色，用于在未选中对话式提问后添加对话项目并指示）
      let arr = Array(length).fill('black');
      arr[length - 1] = '#6A3DFF'
      if(this.chatId !== -1){
        arr[this.chatId] = '#6A3DFF'
      }
      return arr;
    },
    sendId(id){ //修改对话ID后传给父组件，并修改标题颜色用于指示选中的对话项
      this.$emit('custom_event',id)
      this.textColor = Array(this.chatTextList.length).fill("black")
      this.textColor[id] = '#6A3DFF'
    },
    addChat(){ //添加对话并将添加后的对话数组传给父组件
      var newChat = {
        title:'New Chat',
        chatText:[],
        isHelp:[],
      }
      this.textColor = Array(this.chatTextList.length).fill("black")
      this.chatTextList.push(newChat)
      this.textColor.push('#6A3DFF')
      this.isEditing.push(false)
      this.$emit('addChat',this.chatTextList)
    },
    deleteChat(index){ //删除对话并将删除相应对话后的对话数组传给父组件
      if(this.chatTextList.length === 1){
        this.chatTextList = []
      }
      else{
        this.chatTextList.splice(index,1)
      }
      var chatId = this.chatId
      if(index <= this.chatId){
        chatId = this.chatId - 1
        if(chatId < 0){
          chatId = 0
        }
        if(this.chatTextList.length === 0){
          chatId = -1
          this.chatTextList = []
        }
      }
      this.textColor = Array(this.chatTextList.length).fill("black")
      if(chatId!==-1){
        this.textColor[chatId] = '#6A3DFF'
      }
      let data = {
        chatTextList: this.chatTextList,
        chatId: chatId
      }
      console.log(data)
      this.$emit('deleteChat', data)
    },
    edit(index){ //启动修改标题
      this.isEditing = Array(this.chatTextList.length).fill(false)
      this.editedTitle = this.chatTextList[index].title
      this.isEditing[index] = true
    },
    saveTitle(index){ //保存修改后的标题
      if(this.editedTitle!==''){
        this.editedTitle = this.editedTitle.substring(0,15)
        this.chatTextList[index].title = this.editedTitle
        this.$emit('changeTitle',this.chatTextList)
        this.isEditing[index] = false
        this.editedTitle = ''
      }
      else{
        window.alert('修改标题不可为空！')
        this.isEditing[index] = false
        this.editedTitle = ''
        return
      }
    },
    cancel(index){ //取消修改标题
      this.isEditing[index] = false
      this.editedTitle = ''
    },
    deleteList(){ //删除所有对话并将删除后的对话数组和chatId传给父组件
      this.chatTextList = []
      this.chatId = -1
      let data = {
        chatTextList: this.chatTextList,
        chatId: -1
      }
      this.$emit('deleteAll', data)
      console.log('all clear!')
      this.textColor = ['#6A3DFF']
    },
    quickAsk(index){ //左侧栏位的快速提问，将快速提问的问题传给父组件进行相关处理
      if(this.chatId === -1){
        this.addChat()
        this.$emit('quickAsk', this.otherQuestions[index])
        return
      }
      if(this.loading === true){
        window.alert("模型正在解答中，请稍等")
        return

      }
      this.$emit('quickAsk', this.otherQuestions[index])
    }
  },
}
</script>

<template>
  <div id="button" @click="addChat">
    <div id="plus"> <!--新建对话按钮-->
      <img src="../assets/组 5924.png" style="width:26px;height:26px">
    </div>
    <div id="addCon">
      新建对话窗口
    </div>
  </div>
  <div id="chat"> <!--显示对话列表-->
    <div id="chatList">
      <div id="top"> <!--顶部文字标识和删除列表按钮-->
        <div id="listTop">
          <img src="../assets/矩形 1810.png">
          <div id="listTopText">对话窗口列表</div>
        </div>
        <div id="Delete">
          <img src="../assets/删除.png" style="width:18px;height:18px" @click="deleteList">
          <div id="deleteText" @click="deleteList">删除列表</div>
        </div>
      </div>
      <div id="list"> <!--对话列表-->
        <div v-for="(chat,index) in chatTextList" id="listDetail">
          <div v-if="isEditing[index]===false" @click="sendId(index)" id="listItem"> <!--正常状态-->
            <img src="../assets/对话框.png" style="width:18px;height:18px">
            <span id="listText" :style="{ color: textColor[index] }">{{ chat.title }}</span>
            <div id="listButton">
              <img id="editTitle" src="../assets/编辑.png" style="width:18px;height:18px" @click="edit(index)"> <!--修改标题-->
              <img id="deleteChat" src="../assets/删除.png" style="width:18px;height:18px" @click="deleteChat(index)"> <!--删除对话-->
            </div>
          </div>
          <div v-else id="listItem"> <!--修改标题状态-->
            <img src="../assets/对话框.png" style="width:18px;height:18px">
            <input type="text" v-model="editedTitle" id="listText" v-on:keydown.enter="saveTitle(index)">
            <div id="listButtonSave">
              <button @click="saveTitle(index)" id="saveEdit">保存</button>
              <button @click="cancel(index)" id="cancelEdit">取消</button>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div id="divider"></div> <!--分隔栏-->
    <div id="others"> <!--左侧栏快速提问-->
      <div id="askList">
        <div id="listTop">
          <img src="../assets/矩形 1810.png">
          <div id="listTopText">你还可以这样问</div>
          <img src="../assets/刷新.png" id="listRefresh">
        </div>
        <div id="Delete">
          <div id="deleteText" >查看更多 》</div>
        </div>
        <div id="questions">
          <div v-for="(question,index) in otherQuestions" id="questionBox" @click="quickAsk(index)">
            <img src="../assets/常见问题.png" id="questionIcon" style="width: 18px; height:18px;">
            <div id="questionText">{{ question }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#button{
  cursor: pointer;
  width: 92.5%;
  height: 8%;
  left: 3.8%;
  top: 2%;
  position: relative;
  background: linear-gradient(180deg, #C2B5FF 0%, #EFECFA 25%, #FFFFFF 100%);
  box-shadow: 0px 3px 6px 1px #5335C7;
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  z-index: 1;
}
#button #plus{
  position: relative;
  top:28%;
  left: 20%;
  z-index: 10;
}
#button #addCon{
  font-size: 22px;
  top: -5%;
  left: 35%;
  z-index: 15;
  position: relative;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
  line-height: 0px;
  -webkit-background-clip: text;
}
#chat{
  width: 92.5%;
  height: 82%;
  top:5%;
  left:3.8%;
  position: relative;
  background: linear-gradient(181deg, #FFFFFF 0%, #EFECFA 26%, #CAC0FC 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
}
#chat #chatList{
  width:100%;
  height:59%;
}
#chat #chatList #top{
  width:100%;
  height:12%;
}
#chat #chatList #top #listTop{
  height: 1.4%;
  top: 26%;
  left: 3%;
  position: fixed;
  z-index: 25;
}
#chat #chatList #top #listTop #listTopText{
  position: fixed;
  top:26%;
  left: 4%;
  font-size: 14px;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
}
#chat #chatList #top #Delete{
  cursor: pointer;
  position: fixed;
  height: 1.9%;
  top:26%;
  left:20%;
}
#chat #chatList #top #Delete #deleteText{
  cursor: pointer;
  position: fixed;
  top:25.7%;
  left: 21.5%;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #6A3DFF;
}
#chat #chatList #list{
  width:100%;
  height:88%;
  overflow-x: hidden;
  overflow-y: auto;
}
#chat #chatList #listDetail{
  cursor: pointer;
  position: relative;
  left:-0.4%;
  width: 94.5%;
  height: 9.4%;
  background: linear-gradient(180deg, #A892FF 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0.4) 90%, #C4B8FA 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
  margin:3%;
}
#chat #chatList #listDetail #listItem{
  position: relative;
  top: 20%;
  left:3%;
  width:100%;
  height:100%;
}
#chat #chatList #listDetail #listItem #listText{
  font-size: 15px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  position:relative;
  width:70%;
  bottom:5px;
  left:2%;
}
#chat #chatList #listDetail #listItem #editTitle{
  position:relative;
  top:0%;
  left:45%;
}
#chat #chatList #listDetail #listItem #listButton{
  position:relative;
  top:-83%;
  left:80%;
  width:15%;
  display:flex;
  gap:10px;
}
#chat #chatList #listDetail #listItem #listButton #editTitle{
  position:relative;
  left:0%
}
#chat #chatList #listDetail #listItem #listButtonSave{
  position:relative;
  top:-110%;
  left:68%;
  width:30%;
  display:flex;
  gap:10px;
}
#chat #divider{
  width:100%;
  height: 0px;
  opacity: 1;
  border: 1px solid #8064E0;
}
#chat #others{
  width: 100%;
  display:flex;
}
#chat #others #askList{
  width: 100%;
  display: flex;
}
#chat #others #askList #listTop{
  height: 1.4%;
  top: 68%;
  left: 3%;
  position: fixed;
}
#chat #others #listTop #listTopText{
  position: fixed;
  top:68%;
  left: 4%;
  font-size: 14px;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
}
#chat #others #askList #listRefresh{
  cursor: pointer;
  top: 68%;
  left: 11.2%;
  position: fixed;
}
#chat #others #askList #Delete{
  cursor: pointer;
  top: 68%;
  left: 21.5%;
  position: fixed;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #6A3DFF;
}
#chat #others #askList #questions{

  width:100%;
  height:80%;
  position:relative;
  top:40%
}
#chat #others #askList #questions #questionBox{
  cursor: pointer;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0) 8%, rgba(255,255,255,0.4) 93%, #FFFFFF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
  width:95%;
  height:30%;
  display: flex;
  margin:1%;
  padding:1%;
}
#chat #others #askList #questions #questionIcon{
  position:relative;
  left:3%;
  top:14%;
}
#chat #others #askList #questions #questionText{
  position:relative;
  left:6%;
  top:6%;
  font-size: 16px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #4B4B4B;
}
</style>
