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
    },
    Score:{
      type : Number,
      required: true
    },
    contentNum:{
      type : Number,
      required: true
    },
    isEnableContext: Boolean,
    isEnablePrompt: Boolean,
    currentPrompt: String,

  },
  computed: {
    promptStyle() {
      return {
        width: '100%',
        height: '100%',
        fontSize: '15px',
        fontFamily: 'Microsoft YaHei-Regular, Microsoft YaHei',
        fontWeight: 400,
        color: '#4B4B4B',
        lineHeight: '36px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0) 8%, rgba(255,255,255,0.4) 93%, #FFFFFF 100%)',
        webkitBackgroundClip: 'text',
      };
    },
  },
  data(){
    return{
      Score: 500,              // 知识相关度 Score 值
      contentNum: 5,           // 获取知识库内容条数
      isEnableContext: false,   //是否启用上下文关联
      isEnablePrompt: false,    //是否使用提示词
      currentPrompt: '',         //提示词
      isPopupVisible: false,
      showInvalidMessage: false,
      showPromptMessage: false,
      inputData: '',
      isEditing: Array(this.chatList.length).fill(false),
      chatText: [],
      chatList: this.chatList,
      textColor: Array(this.chatList.length).fill("black"),
      isError: false,
      chatId: 0,
      apiUrl: 'http://127.0.0.1:5000/get-answer',
      editedTitle: '',
    };
  },
  methods: {
    // 更新参数修改
    toggleContext() {
      this.isEnableContext = !this.isEnableContext;
      this.$emit('update-context', this.isEnableContext);
    },
    togglePrompt() {
      this.isEnablePrompt = !this.isEnablePrompt;
      this.$emit('update-enable-prompt', this.isEnablePrompt);
    },
    promptDetail() {
      this.isPopupVisible = true;
    },
    hidePopup() {
      this.isPopupVisible = false;
    },
    updateScore() {
      this.$emit('update-score', this.Score);
    },
    updateContentNum() {
      const parsedNum = parseInt(this.contentNum, 10); // 解析输入为整数
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
        this.contentNum = parsedNum; // 更新合法输入值
        this.showInvalidMessage = false; // 隐藏提示消息
      } else {
        this.showInvalidMessage = true; // 显示提示消息
      }
      this.$emit('update-content-num', this.contentNum);
    },
    updateCurrentPrompt() {
      const containsQuest = this.currentPrompt.includes("{quest}");
      const containsDocuments = this.currentPrompt.includes("{documents}");
      if (containsQuest && containsDocuments) {
        this.showPromptMessage = false; // 隐藏提示消息
      } else {
        this.showPromptMessage = true; // 显示提示消息
      }
      this.$emit('update-current-prompt', this.currentPrompt);
    },
    initTextColor(length) {
      let arr = Array(length).fill('black');
      arr[length - 1] = '#6A3DFF';
      return arr;
    },
    sendData(id) {
      this.$emit('custom_event', id)
      this.textColor = Array(this.chatList.length).fill("black")
      this.textColor[id] = '#6A3DFF'
      console.log(id)
    },
    deleteChat(index) {
      this.chatList.splice(index, 1)
      var chatId = this.chatId
      if (index <= this.chatId) {
        chatId = this.chatId - 1
        if (chatId < 0) {
          chatId = 0
        }
        if (this.chatList.length === 0) {
          chatId = -1
        }
      }
      this.textColor = Array(this.chatList.length).fill("black")
      if (chatId !== -1) {
        this.textColor[chatId] = '#6A3DFF'
      }
      let data = {
        chatList: this.chatList,
        chatId: chatId
      }
      this.$emit('deleteChat', data)
    },
    // 删除所有对话记录
    deleteList() {
      this.chatList = []
      this.$emit('deleteAll')
      console.log('all clear!')
    },
  }
}
</script>

<template>
  <div id="button" @click="deleteList">
    <div id="delete">
      <img src="../assets/ConManage/组%205928.png" style="width:26px;height:26px">
    </div>
    <div id="deleteCon">
      清除对话记录
    </div>
  </div>
  <div id="adjust">
    <div id="para">
      <div id="top">
        <div id="listTop">
          <img src="../assets/ConManage/矩形 1778.png">
          <div id="listTopText">参数调整窗口</div>
        </div>
      </div>
      <div id="list">  <!--上方参数调整部分-->
        <div id="repository">
          <div id="top">
            <div id="topText">
              知识库设定
            </div>
          </div>
          <div id="detail">
            <div id="scoreText">知识相关度 Score 值，分值越低匹配度越高</div>
            <input type="text" v-model="Score" id="Score" @input="updateScore">
            <div id="numText">获取知识库内容条数</div>
            <input type="text" v-model="contentNum" id="contentNum" @input="updateContentNum">
            <p v-if="showInvalidMessage" style="color: red; font-size: 12px;margin-left: 5%;margin-top: 1%;">请输入合法的数字范围（1-5）</p>
          </div>
        </div>
        <div id="divider1"></div>
        <div id="context">
          <div id="isEnable"  @click="toggleContext">
            <img id="false" v-if="!isEnableContext" src="../assets/ConManage/矩形%201815.png"  />
            <img id="true" v-else src="../assets/ConManage/组%205929.png" />
          </div>
          <div id="text">是否启用上下文关联</div>
        </div>
      </div>
    </div>
    <div id="divider"></div>
    <div id="prompt">  <!--左侧提示词部分-->
      <div id="top">
        <div id="listTop">
          <img src="../assets/ConManage/矩形 1778.png">
          <div id="listTopText">prompt调整</div>
          <div id="detail">
            <img src="../assets/ConManage/提示.png" style="width:18px;height:18px" @click="promptDetail">
            <div v-if="isPopupVisible" class="popup">
              <button @click="hidePopup" class="close-button">X</button>
              <p style="position: relative;margin-top: -15%;font-size: 14px;">提示词详情信息</p>
            </div>
          </div>

        </div>
      </div>
      <div id="usePrompt">    <!--提示词部分-->
        <div id="checkbox">
          <div id="isEnable"  @click="togglePrompt">
            <img id="false" v-if="!isEnablePrompt" src="../assets/ConManage/矩形%201815.png"  />
            <img id="true" v-else src="../assets/ConManage/组%205929.png" />
          </div>
          <div id="text">使用提示</div>
        </div>
        <div id="container">
          <div id="content">
            <textarea
                class="prompt"
                v-model="currentPrompt"
                :style="promptStyle"
                placeholder="请输入提示词"
                @input="updateCurrentPrompt"
            ></textarea>
          </div>
          <p v-if="showPromptMessage" style="color: red; font-size: 12px;">提示词必须包含 {quest} 和 {documents}</p>
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
#button #delete{
  position: relative;
  top:28%;
  left: 20%;
  z-index: 10;
}
#button #deleteCon{
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
#adjust{
  width: 92.5%;
  height: 82%;
  top:5%;
  left:3.8%;
  position: relative;
  background: #EDEBFF;
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
}
#adjust #para{
  width:100%;
  height:69.6%;
}
#adjust #para #top{
  width:100%;
  height:12%;
}
#adjust #para #top #listTop{
  height: 1.4%;
  top: 26%;
  left: 3%;
  position: fixed;
  z-index: 25;
}
#adjust #para #top #listTop #listTopText{
  position: fixed;
  top:26%;
  left: 4%;
  font-size: 16px;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
}
#adjust #para #list{
  width:94.8%;
  height:60%;
  margin-left: 2.5%;
  margin-top: 1%;
  background: #FFFFFF;
  box-shadow: 2px 3px 6px 1px rgba(0,0,0,0.15);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #DFDFDF;
}
#adjust #para #list #repository{
  width: 100%;
  height: 70%;
}
#adjust #para #list #repository #top #topText{
  margin-top:4.8%;
  margin-left: 4.3%;
  width: 62.5%;
  height: 10.7%;
  font-size: 16px;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
  color: #6A3DFF;
  line-height: 0px;
  -webkit-background-clip: text;
  /*-webkit-text-fill-color: transparent;*/
}
#adjust #para #list #repository #detail{
  margin-left: 3.3%;
  top: 22.7%;
  width: 93.5%;
  height: 80%;
  background: linear-gradient(180deg, #FFFFFF 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  border: 1px solid #CECECE;
}
#adjust #para #list #repository #detail #scoreText{
  margin-top: 5%;
  margin-left: 5%;
  width: 90.8%;
  height: 10%;
  font-size: 5px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #6E6E6E;
  line-height: 0px;
  -webkit-background-clip: text;
}
#adjust #para #list #repository #detail #Score{
  margin-top: 0.5%;
  margin-left: 5%;
  width: 87%;
  height: 17%;
  background: linear-gradient(180deg, #ECECEC 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #CECECE;
}
#adjust #para #list #repository #detail #numText{
  margin-top: 5%;
  margin-left: 5%;
  width: 90.8%;
  height: 10%;
  font-size: 6px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #6E6E6E;
  line-height: 0px;
  -webkit-background-clip: text;
}
#adjust #para #list #repository #detail #contentNum{
  margin-left: 5%;
  width: 87%;
  height: 17%;
  background: linear-gradient(180deg, #ECECEC 0%, #FDFDFD 17%, #FFFFFF 100%);
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #CECECE;
}
#adjust #para #list #divider1{
  top: 1%;
  width: 100%;
  height: 0px;
  opacity: 1;
  border: 1px solid #E2E2E2;
}
#adjust #para #list #context{
  width: 100%;
  height: 13%;
}
#adjust #para #list #context #text{
  top: 57%;
  margin-left: 4%;
  width: 60%;
  height: 60%;
  position: fixed;
  font-size: 15px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #000000;
  line-height: 0px;
  -webkit-background-clip: text;
}
#adjust #para #list #context #isEnable{
  margin-top: 3%;
  margin-left: 6%;
  width:4%;
  height: 50%;
  cursor: pointer;
}
#adjust #divider{
  position: relative;
  top: -13%;
  width:100%;
  height: 0px;
  opacity: 1;
  border: 1px solid #2D6CFA;
}
#adjust #prompt{
  width: 100%;
}
#adjust #prompt #top{
  top: 1%;
  width: 100%;
  height: 10%;
  left: 3.3%;
}
#adjust #prompt #usePrompt #checkbox #isEnable{
  position: relative;
  margin-top: -10%;
  margin-left: 6%;
  width: 10%;
  height: 80%;
  color: #6A3DFF;
  cursor: pointer;
}
#adjust #prompt #usePrompt #checkbox #text{
  position: relative;
  margin-top: -4%;
  margin-left: 15%;
  width: 60%;
  height: 60%;
  font-size: 15px;
  font-family: Microsoft YaHei-Regular, Microsoft YaHei;
  font-weight: 400;
  color: #000000;
  line-height: 0px;
  -webkit-background-clip: text;
}
#adjust #prompt #usePrompt #container{
  position: fixed;
  justify-content: center;
  align-items: center;
  width: 23.4%;
  height: 17%;
  margin-left: 1.5%;
  margin-top: 1.5%;
}
#adjust #prompt #usePrompt #container #content {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0) 8%, rgba(255,255,255,0.4) 93%, #FFFFFF 100%);
  border-radius: 10px;
  opacity: 1;
  border: 1px solid #CECECE;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}
.prompt {
  position: relative;
  resize: none;
  border: 1px solid transparent;
  width: 100%;
  height: 300%;
  text-align: center;
  margin: 0;
  outline: none;
}

#adjust #prompt #top #listTop{
  top: 66%;
  height: 10%;
  left: 3%;
  position: fixed;
}
#adjust #prompt #top #listTop #listTopText{
  position: fixed;
  top: 67%;
  left: 4%;
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-size: 16px;
  font-weight: bold;
  color: #6A3DFF;
  line-height: 0px;
  -webkit-background-clip: text;
  /*-webkit-text-fill-color: transparent;*/
}
#adjust #prompt #top #listTop #detail{
  position: fixed;
  top:66%;
  left: 25%;
  cursor: pointer;
}
.popup {
  position: fixed;
  top: 66%;
  left: 15%;
  width: 10%;
  height: 5%;
  background-color: rgba(255, 255, 255, 1); /* 不透明的白色背景 */
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: relative;
  top: -15%;
  left: 90%;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 4;
}

</style>
