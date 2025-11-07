<template>
  <div class="sys-database-container">
    <el-select v-model="state.configId" placeholder="库名" filterable>
      <el-option v-for="item in state.dbData" :key="item" :label="item" :value="item" />
    </el-select>
    <el-input v-model="state.sql" :rows="5" type="textarea" placeholder="写入执行sql" />
    <br /><br />
    <el-space :size="10" spacer="|" style="justify-content: right;">
      <el-button type="success" @click="sqlQueryHandle">查 询</el-button>
      <el-button type="danger" @click="sqlExcuteHandle">执 行</el-button>
    </el-space>
    <el-input v-show="state.jsonStr" v-model="state.jsonStr" autosize type="textarea" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { getAPI } from '/@/utils/axios-utils';
import { SysDatabaseApi } from '/@/api-services/apis/sys-database-api';
import { PostSqlQuery, PostSqlExecute } from '/@/api/adminExtend';

const state = reactive({ sql: "", jsonStr: '', configId: '1300000000001', dbData: [] as any });
onMounted(async () => {
  var res = await getAPI(SysDatabaseApi).apiSysDatabaseListGet();
  state.dbData = res.data.result;
});
const clickFormat = () => {
  // 1、JSON.parse：把JSON字符串转换为JSON对象
  // 2、JSON.stringify：把JSON对象 转换为 有缩进的 JSON字符串格式
  state.jsonStr = JSON.stringify(JSON.parse(state.jsonStr), null, '\t')
}

const sqlQueryHandle = () => {
  PostSqlQuery(state.configId, state.sql).then(res => {
    state.jsonStr = JSON.stringify(res.data);
    clickFormat();
  });
}
const sqlExcuteHandle = () => {
  PostSqlExecute(state.configId, state.sql).then(res => {
    state.jsonStr = JSON.stringify(res.data);
    clickFormat();
  });
}
</script>