<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="title">团队任务管理</div>
      
      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登 录" name="login">
          <el-form :model="loginForm" @keyup.enter="doLogin" style="margin-top: 15px;">
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="请输入账号" size="large"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password size="large"></el-input>
            </el-form-item>
            <el-button type="primary" size="large" style="width: 100%; border-radius: 8px;" @click="doLogin" :loading="loading">
              立即登录
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注 册" name="register">
          <el-form :model="regForm" style="margin-top: 15px;">
            <el-form-item>
              <el-input v-model="regForm.username" placeholder="设置新账号" size="large"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.password" type="password" placeholder="设置密码" show-password size="large"></el-input>
            </el-form-item>
            <el-button type="success" size="large" style="width: 100%; border-radius: 8px;" @click="doRegister" :loading="loading">
              注册账号
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)
const loginForm = reactive({ username: '', password: '' })
const regForm = reactive({ username: '', password: '' })

// 登录逻辑
const doLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    return ElMessage.warning('账号和密码不能为空哦')
  }
  loading.value = true
  try {
    const res = await axios.post('/users/login', loginForm)
    if (res.data.code === 200) {
      ElMessage.success('登录成功，欢迎回来！')
      localStorage.setItem('token', res.data.data.token)
      localStorage.setItem('username', res.data.data.username)
      
    
      setTimeout(() => {
        router.push('/projects')
      }, 1000)
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    ElMessage.error('无法连接到后端，请检查后端服务是否启动')
  } finally {
    loading.value = false
  }
}

// 注册逻辑
const doRegister = async () => {
  if (!regForm.username || !regForm.password) {
    return ElMessage.warning('账号和密码不能为空哦')
  }
  loading.value = true
  try {
    const res = await axios.post('/users/register', regForm)
    if (res.data.code === 200) {
      ElMessage.success('注册成功！快去登录吧')
      activeTab.value = 'login'
      loginForm.username = regForm.username
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    ElMessage.error('无法连接到后端')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 350px;
  backdrop-filter: blur(10px);
}
.title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}
</style>