<template>
  <div class="projects-layout">
    <header class="app-header">
      <div class="logo">✨ 团队任务管理系统</div>
      <div class="user-info">
        <span class="welcome-text">欢迎，{{ username }}</span>
        <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="main-content">
      <div class="page-header">
        <h2>我的项目</h2>
        <el-button type="primary" size="large" @click="dialogVisible = true">
          + 新建项目
        </el-button>
      </div>

      <div v-loading="loading" style="min-height: 300px;">
        <el-empty v-if="!loading && projectList.length === 0" description="暂无项目，快去创建一个吧！" />
        
        <div class="project-grid" v-else>
          <el-card v-for="project in projectList" :key="project.id" class="project-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="project-name">{{ project.name }}</span>
              </div>
            </template>
            <div class="card-body">
              <p class="project-desc">{{ project.description || '暂无描述信息...' }}</p>
            </div>
            <div class="card-footer">
              <el-button type="primary" link>进入项目 ➔</el-button>
            </div>
          </el-card>
        </div>
      </div>
    </main>

    <el-dialog v-model="dialogVisible" title="🌟 新建项目" width="30%" destroy-on-close>
      <el-form :model="projectForm" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="projectForm.name" placeholder="项目名称"></el-input>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="projectForm.description" type="textarea" :rows="4" placeholder="简单描述一下这个项目的目标..."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitCreateProject" :loading="submitLoading">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
// 从本地存储获取用户名展示
const username = ref(localStorage.getItem('username') || '未知用户')

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const projectList = ref([])

const projectForm = reactive({
  name: '',
  description: ''
})

// 1. 获取我的项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await axios.get('/projects/list')
    if (res.data.code === 200) {
      projectList.value = res.data.data
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 2. 提交创建项目
const submitCreateProject = async () => {
  if (!projectForm.name.trim()) {
    return ElMessage.warning('项目名称不能为空！')
  }
  submitLoading.value = true
  try {
    const res = await axios.post('/projects/create', projectForm)
    if (res.data.code === 200) {
      ElMessage.success('项目创建成功！')
      dialogVisible.value = false // 关闭弹窗
      projectForm.name = ''       // 清空表单
      projectForm.description = ''
      fetchProjects()             // 重新拉取最新的项目列表
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitLoading.value = false
  }
}

// 3. 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  ElMessage.success('已安全退出')
  router.push('/') // 跳转回登录页
}

// 页面一加载，就自动去后端拉取项目列表
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.welcome-text {
  margin-right: 20px;
  color: #606266;
  font-size: 14px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

/* 使用 CSS Grid 布局让卡片整齐排列 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.project-card {
  border-radius: 12px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-5px);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.card-body {
  padding: 10px 0;
  min-height: 60px;
}

.project-desc {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  /* 超过三行自动显示省略号 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.card-footer {
  margin-top: 15px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}
</style>