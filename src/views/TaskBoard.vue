<template>
  <div class="board-layout">
    <header class="board-header">
      <div class="left">
        <el-button icon="Back" circle @click="router.push('/projects')" />
        <h2 class="project-title">项目看板</h2>
      </div>
      <div class="right-actions">
        <el-select v-model="filterPriority" clearable placeholder="优先级筛选" style="width: 120px; margin-right: 15px;">
          <el-option label="🔴 高优先级" :value="2" />
          <el-option label="🟡 中优先级" :value="1" />
          <el-option label="🟢 低优先级" :value="0" />
        </el-select>
        <el-select v-model="filterAssignee" clearable placeholder="指派人筛选" style="width: 120px; margin-right: 15px;">
          <el-option v-for="user in userList" :key="user.id" :label="user.username" :value="user.id" />
        </el-select>
        
        <el-button type="primary" @click="dialogVisible = true">+ 新建任务</el-button>
      </div>
    </header>

    <main class="kanban-container" v-loading="loading">
      <div class="kanban-column">
        <div class="column-header todo-header">待处理</div>
        <draggable v-model="todoList" group="tasks" item-key="id" class="drag-area" @add="(evt) => handleDragEnd(evt, 0)">
          <template #item="{ element }">
            <div class="task-card" v-show="matchesFilter(element)">
              <div class="task-title">{{ element.title }}</div>
              <div class="task-desc">{{ element.description }}</div>
              <div class="task-meta">
                <span>{{ formatPriority(element.priority) }}</span>
                <span v-if="element.deadline" style="color: #f56c6c;"> | 截止: {{ formatDate(element.deadline) }}</span>
              </div>
              <div class="task-assignee">指派给: {{ getAssigneeName(element.assigneeId) }}</div>
            </div>
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <div class="column-header doing-header">进行中</div>
        <draggable v-model="doingList" group="tasks" item-key="id" class="drag-area" @add="(evt) => handleDragEnd(evt, 1)">
          <template #item="{ element }">
            <div class="task-card" v-show="matchesFilter(element)">
              <div class="task-title">{{ element.title }}</div>
              <div class="task-desc">{{ element.description }}</div>
              <div class="task-meta">
                <span>{{ formatPriority(element.priority) }}</span>
                <span v-if="element.deadline" style="color: #f56c6c;"> | 截止: {{ formatDate(element.deadline) }}</span>
              </div>
              <div class="task-assignee">指派给: {{ getAssigneeName(element.assigneeId) }}</div>
            </div>
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <div class="column-header done-header">已完成</div>
        <draggable v-model="doneList" group="tasks" item-key="id" class="drag-area" @add="(evt) => handleDragEnd(evt, 2)">
          <template #item="{ element }">
            <div class="task-card done-card" v-show="matchesFilter(element)">
              <div class="task-title">{{ element.title }}</div>
              <div class="task-desc">{{ element.description }}</div>
              <div class="task-meta">
                <span>{{ formatPriority(element.priority) }}</span>
              </div>
              <div class="task-assignee">指派给: {{ getAssigneeName(element.assigneeId) }}</div>
            </div>
          </template>
        </draggable>
      </div>
    </main>

    <el-dialog v-model="dialogVisible" title="📌 新建任务" width="400px" destroy-on-close>
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="任务标题">
          <el-input v-model="taskForm.title" placeholder="一句话描述任务..."></el-input>
        </el-form-item>
        <el-form-item label="详细描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" placeholder="任务的具体要求..."></el-input>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" style="width: 100%">
            <el-option label="🟢 低优先级" :value="0" />
            <el-option label="🟡 中优先级" :value="1" />
            <el-option label="🔴 高优先级" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker v-model="taskForm.deadline" type="datetime" placeholder="选择日期和时间" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="指派给">
          <el-select v-model="taskForm.assigneeId" clearable placeholder="选择任务负责人" style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="user.username" :value="user.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCreateTask" :loading="submitLoading">创 建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id 

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)

// 任务列表和用户列表
const todoList = ref([])
const doingList = ref([])
const doneList = ref([])
const userList = ref([])

// 筛选条件
const filterPriority = ref('')
const filterAssignee = ref('')

const taskForm = reactive({
  title: '',
  description: '',
  priority: 1,
  deadline: '',
  assigneeId: ''
})

// 匹配筛选条件 
const matchesFilter = (task) => {
  if (filterPriority.value !== '' && task.priority !== filterPriority.value) return false;
  if (filterAssignee.value !== '' && task.assigneeId !== filterAssignee.value) return false;
  return true;
}

// 格式化展示助手函数
const formatPriority = (level) => level === 2 ? '🔴 高' : (level === 1 ? '🟡 中' : '🟢 低')
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}
const getAssigneeName = (userId) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? user.username : '未指派'
}

// 获取用户列表 (用于指派)
const fetchUsers = async () => {
  try {
    const res = await axios.get('/users/list')
    if (res.data.code === 200) userList.value = res.data.data
  } catch (error) {
    console.error('获取用户列表失败', error)
  }
}

// 获取任务并分类
const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/tasks/list?projectId=${projectId}`)
    if (res.data.code === 200) {
      todoList.value = []
      doingList.value = []
      doneList.value = []
      res.data.data.forEach(task => {
        if (task.status === 0) todoList.value.push(task)
        else if (task.status === 1) doingList.value.push(task)
        else if (task.status === 2) doneList.value.push(task)
      })
    }
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 新建任务
const submitCreateTask = async () => {
  if (!taskForm.title.trim()) return ElMessage.warning('任务标题不能为空！')
  submitLoading.value = true
  try {
    const payload = { ...taskForm, projectId: projectId }
    const res = await axios.post('/tasks/create', payload)
    if (res.data.code === 200) {
      ElMessage.success('任务创建成功！')
      dialogVisible.value = false
      Object.assign(taskForm, { title: '', description: '', priority: 1, deadline: '', assigneeId: '' })
      fetchTasks() 
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    ElMessage.error('创建任务失败')
  } finally {
    submitLoading.value = false
  }
}

// 拖拽结束更新状态
const handleDragEnd = async (evt, newStatus) => {
  const item = evt.item._underlying_vm_
  if (!item) return
  try {
    const res = await axios.post(`/tasks/status?taskId=${item.id}&status=${newStatus}`)
    if (res.data.code === 200) {
      ElMessage.success('状态已更新')
    } else {
      ElMessage.error('状态更新失败，请刷新页面')
      fetchTasks() 
    }
  } catch (error) {
    ElMessage.error('网络错误，状态更新失败')
    fetchTasks() 
  }
}

onMounted(() => {
  fetchUsers()
  fetchTasks()
})
</script>

<style scoped>
/* 样式与之前基本一致，略微优化了卡片显示 */
.board-layout { height: 100vh; display: flex; flex-direction: column; background-color: #f0f2f5; }
.board-header { height: 60px; background-color: white; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,21,41,0.08); }
.left { display: flex; align-items: center; gap: 15px; }
.right-actions { display: flex; align-items: center; }
.project-title { margin: 0; font-size: 18px; color: #333; }
.kanban-container { flex: 1; display: flex; gap: 20px; padding: 20px; overflow-x: auto; }
.kanban-column { flex: 1; min-width: 300px; background-color: #ebecf0; border-radius: 8px; display: flex; flex-direction: column; max-height: calc(100vh - 100px); }
.column-header { padding: 12px 16px; font-weight: bold; font-size: 15px; border-radius: 8px 8px 0 0; }
.todo-header { border-top: 3px solid #ff9f43; }
.doing-header { border-top: 3px solid #00cfe8; }
.done-header { border-top: 3px solid #28c76f; }
.drag-area { flex: 1; padding: 10px; overflow-y: auto; min-height: 150px; }
.task-card { background-color: white; border-radius: 6px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); cursor: grab; transition: transform 0.2s; }
.task-card:active { cursor: grabbing; }
.done-card { opacity: 0.6; }
.task-title { font-weight: bold; color: #333; margin-bottom: 6px; font-size: 14px; }
.task-desc { font-size: 12px; color: #666; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.task-meta { font-size: 12px; color: #999; margin-bottom: 4px; }
.task-assignee { font-size: 12px; color: #409EFF; background: #ecf5ff; padding: 2px 6px; border-radius: 4px; display: inline-block; }
</style>