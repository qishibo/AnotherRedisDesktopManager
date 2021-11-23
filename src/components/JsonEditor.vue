<template>
  <div class="text-formated-container">
    <slot name='default'></slot>
    <!-- collapse btn -->
    <div class="collapse-container">
      <el-button class="collapse-btn"  type="text" @click="toggleCollapse">{{ $t('message.' + collapseText) }}</el-button>
    </div>

    <!-- monaco editor div -->
    <div id="monaco-editor-con" ref="editor"></div>
  </div>
</template>

<script type="text/javascript">
import * as monaco from 'monaco-editor';

export default {
  data() {
    return {
      collapseText: 'collapse_all',
    };
  },
  props: {
    content: {type: Array|String, default: () => {}},
    readOnly: {type: Boolean, default: true},
  },
  computed: {
    newContentStr() {
      if (typeof this.content === 'string') {
        return this.content;
      }
      
      return JSON.stringify(this.content, null, 4);
    },
  },
  watch: {
    // refresh
    content() {
      this.$nextTick(() => {
        this.monacoEditor.setValue(this.newContentStr);
      });
    },
  },
  methods: {
    getContent() {
      let content = this.monacoEditor.getValue();

      if (!this.$util.isJson(content)) {
        this.$message.error(this.$t('message.json_format_failed'));
        return false;
      }

      return Buffer.from(JSON.stringify(JSON.parse(content), null, 0));
    },
    toggleCollapse() {
      this.collapseText == 'expand_all' ? this.monacoEditor.trigger('fold', 'editor.unfoldAll') :
                                          this.monacoEditor.trigger('fold', 'editor.foldAll');
      this.collapseText = this.collapseText == 'expand_all' ? 'collapse_all' : 'expand_all';
    },
    onResize() {
      // init resizeDebounce
      if (!this.resizeDebounce) this.resizeDebounce = this.$util.debounce(() => {
        this.monacoEditor && this.monacoEditor.layout();
      }, 200);

      this.resizeDebounce();
    },
  },

  mounted() {
    this.monacoEditor = monaco.editor.create(
      this.$refs.editor, 
      {
        value: this.newContentStr,
        theme: 'vs-dark',
        language: 'json', 
        links: false,
        readOnly: this.readOnly,
        cursorStyle: this.readOnly ? 'underline-thin' : 'line',
        lineNumbers: 'off',
        contextmenu: false,
        showFoldingControls: 'always',
        // auto layout, performance cost
        // automaticLayout: true,
        wordWrap: 'on',
        // long text indent when wrapped
        wrappingIndent: 'indent',
        // cursor line highlight
        renderLineHighlight: 'none',
        // highlight word when cursor in
        occurrencesHighlight: false,
        // disable scroll one page at last line
        scrollBeyondLastLine: false,
        // hide scroll sign of current line
        hideCursorInOverviewRuler: true,
        minimap: {
          enabled: false,
        },
        // vertical line
        guides: {
          indentation: false,
          highlightActiveIndentation: false,
        },
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: '9px',
          horizontalScrollbarSize: '9px',
        },
      }
    );

    window.addEventListener("resize", this.onResize);
    // this.monacoEditor.getAction('editor.foldLevel3').run();
    // this.monacoEditor.getAction('editor.action.formatDocument').run();
  },
  destroyed() {
    window.removeEventListener("resize", this.onResize);
  },
}
</script>

<style type="text/css">
  .text-formated-container #monaco-editor-con {
    min-height: 150px;
    max-height: 100vh;
    clear: both;
    overflow: hidden;
    background: none;
  }
  /*recovery collapse icon font in monaco*/
  .text-formated-container .monaco-editor .codicon {
    font-family: codicon !important;
  }

  /*change default scrollbar style*/
  .text-formated-container .monaco-editor .scrollbar {
    background: #eaeaea;
    border-radius: 4px;
  }
  .dark-mode .text-formated-container .monaco-editor .scrollbar {
    background: #475156;
  }
  .text-formated-container .monaco-editor .scrollbar:hover {
    background: #e0e0dd;
  }
  .dark-mode .text-formated-container .monaco-editor .scrollbar:hover {
    background: #565656;
  }

  .text-formated-container #monaco-editor-con .monaco-editor .slider {
    border-radius: 4px;
    background: #c1c1c1;
  }
  .dark-mode .text-formated-container #monaco-editor-con .monaco-editor .slider {
    background: #5d676d;
  }
  .text-formated-container #monaco-editor-con .monaco-editor .slider:hover {
    background: #7d7d7d;
  }

  /*remove background color*/
  .text-formated-container .monaco-editor .margin {
    background-color: inherit;
  }
  #monaco-editor-con .monaco-editor, #monaco-editor-con .monaco-editor-background, #monaco-editor-con .monaco-editor .inputarea.ime-input {
    background-color: inherit;
  }

  /*json key color*/
  #monaco-editor-con .mtk4 {
    color: #111111;
  }
  .dark-mode #monaco-editor-con .mtk4 {
    color: #ebebec;
  }
  /*json val string color*/
  #monaco-editor-con .mtk5 {
    color: #42b983;
  }
  /*json val number color*/
  #monaco-editor-con .mtk6 {
    color: #fc1e70;
  }
  /*json bracket color*/
  #monaco-editor-con .mtk9 {
    color: #111111;
  }
  /*json bracket color*/
  .dark-mode #monaco-editor-con .mtk9 {
    color: #b6b6b9;
  }
</style>
