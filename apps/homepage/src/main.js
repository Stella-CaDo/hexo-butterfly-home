import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { ElRow, ElCol, ElProgress } from 'element-plus';
import 'element-plus/theme-chalk/el-row.css';
import 'element-plus/theme-chalk/el-col.css';
import 'element-plus/theme-chalk/el-progress.css';
import 'element-plus/theme-chalk/el-message.css';
import '@/style/style.scss';
import '@/style/overrides.scss';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
for (const component of [ElRow, ElCol, ElProgress]) app.component(component.name, component);
app.mount('#app');
