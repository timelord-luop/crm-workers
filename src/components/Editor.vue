<template>
  <div class="editor-container">
    <div class="editor-shell">
      <Toolbar
        class="editor-toolbar"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        :style="{ height: height, overflowY: 'hidden' }"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="onCreated"
        @onChange="onChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, defineAsyncComponent } from 'vue';

import '@wangeditor/editor/dist/css/style.css';

// 异步引入 Editor 组件
const Editor = defineAsyncComponent(() =>
	import('@wangeditor/editor-for-vue').then(m => m.Editor)
);

// 异步引入 Toolbar 组件
const Toolbar = defineAsyncComponent(() =>
	import('@wangeditor/editor-for-vue').then(m => m.Toolbar)
);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '200px'
  }
});

const emit = defineEmits(['update:modelValue']);

const editorRef = ref(null);
const valueHtml = ref(props.modelValue);

// 配置工具栏：只保留最常用的工具
const toolbarConfig = ref({
  toolbarKeys: [
    // 标题和格式
    // 'headerSelect',      // 标题选择
    'bold',              // 加粗
    'underline',         // 下划线
    'through',           // 删除线

    // 对齐方式
    'bulletedList',      // 无序列表
    'numberedList',      // 有序列表
    'justifyLeft',       // 左对齐
    'justifyCenter',     // 居中对齐
    'justifyRight',      // 右对齐

    // 文本样式
    'color',             // 文字颜色
    'insertTable',             // 表格

    // 其他常用
    'undo',              // 撤销
    'clearStyle',        // 清除格式
  ]
});

// 编辑器配置：移除上传相关的配置
const editorConfig = ref({
  placeholder: '请输入内容...',
  // 禁用上传图片、视频等功能
  MENU_CONF: {
    // 禁用上传图片
    uploadImage: {
      server: undefined,
      customUpload: undefined,
    },
    // 禁用上传视频
    uploadVideo: {
      server: undefined,
    },
    // 禁用上传附件
    uploadAttachment: {
      server: undefined,
    }
  }
});

const mode = ref('simple'); // 'simple' 或 'default'

const onCreated = (editor) => {
  editorRef.value = Object.seal(editor);

  // 可选：移除不需要的菜单项（额外的安全措施）
  if (editor && editor.getAllMenuKeys) {
    const allMenus = editor.getAllMenuKeys();
    const allowedMenus = toolbarConfig.value.toolbarKeys;
    // 这个方法只是用来调试，不影响实际功能
  }
};

const onChange = (editor) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit('update:modelValue', html);
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    editor.destroy();
  }
});

watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal;
  }
});
</script>

<style scoped>
.editor-container {
  width: 100%;
}

:deep(.editor-shell) {
  border: 1px solid #d9e1ef;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.editor-shell:focus-within) {
  border-color: #9fc5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.14);
}

:deep(.editor-toolbar) {
  border-bottom: 1px solid #e7edf6;
}

:deep(.editor-toolbar .w-e-bar) {
  padding: 0 6px;
  background: #f9fbff;
}

:deep(.w-e-text-container) {
  background: #fff;
}

:deep(.w-e-text-container [data-slate-editor]) {
  padding: 8px 12px;
  line-height: 1.6;
}

:deep(.w-e-text-container [data-slate-editor] p) {
  margin: 5px 0 !important;
}

:deep(.w-e-text-container [data-slate-editor] > p:first-child) {
  margin-top: 0 !important;
}

:deep(.w-e-text-container [data-slate-editor] > p:last-child) {
  margin-bottom: 0 !important;
}

:deep(.w-e-text-placeholder) {
  left: 12px;
  top: 8px;
  font-style: normal;
  line-height: 1.6;
}
</style>
