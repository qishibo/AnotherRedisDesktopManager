<template>
  <div class="text-formated-container">
    <slot name='default'></slot>
    <!-- collapse btn -->
    <div class="collapse-container">
      <el-button class="collapse-btn"  type="text" @click="toggleCollapse">{{ $t('message.' + collapseText) }}</el-button>
    </div>

    <!-- monaco editor div -->
    <div class="monaco-editor-con" ref="editor"></div>
  </div>
</template>

<script type="text/javascript">
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
const JSONbig = require('@qii404/json-bigint')({useNativeBigInt: false});

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
  created() {
    // listen font family change and reset options
    // to avoid cursor offset
    this.$bus.$on('fontInited', this.changeFont);
  },
  computed: {
    newContentStr() {
      if (typeof this.content === 'string') {
        return this.content;
      }

      return JSONbig.stringify(this.content, null, 4);
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

      return Buffer.from(JSONbig.stringify(JSONbig.parse(content), null, 0));
    },
    getRawContent(removeJsonSpace = false) {
      let content = this.monacoEditor.getValue();

      if (removeJsonSpace) {
        if (this.$util.isJson(content)) {
          content = JSONbig.stringify(JSONbig.parse(content), null, 0);
        }
      }

      return content;
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
    changeFont(fontFamily) {
      this.monacoEditor && this.monacoEditor.updateOptions({
        fontFamily: fontFamily,
      });
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
        // set fontsize and family to avoid cursor offset
        fontSize: 14,
        fontFamily: this.$storage.getFontFamily(),
        showFoldingControls: 'always',
        // auto layout, performance cost
        automaticLayout: true,
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

    // window.addEventListener("resize", this.onResize);
    // this.monacoEditor.getAction('editor.foldLevel3').run();
    // this.monacoEditor.getAction('editor.action.formatDocument').run();
  },
  destroyed() {
    // window.removeEventListener("resize", this.onResize);
    this.monacoEditor.dispose();
    this.$bus.$off('fontInited', this.changeFont);
  },
}
</script>

<style type="text/css">
  .text-formated-container .monaco-editor-con {
    min-height: 150px;
    height: calc(100vh - 730px);
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
    background: #425057;
  }
  .text-formated-container .monaco-editor .scrollbar:hover {
    background: #e0e0dd;
  }
  .dark-mode .text-formated-container .monaco-editor .scrollbar:hover {
    background: #495961;
  }

  .text-formated-container .monaco-editor-con .monaco-editor .slider {
    border-radius: 4px;
    background: #c1c1c1;
  }
  .dark-mode .text-formated-container .monaco-editor-con .monaco-editor .slider {
    background: #5a6f7a;
  }
  .text-formated-container .monaco-editor-con .monaco-editor .slider:hover {
    background: #7f7f7f;
  }
  .dark-mode .text-formated-container .monaco-editor-con .monaco-editor .slider:hover {
    background: #6a838f;
  }

  /*remove background color*/
  .text-formated-container .monaco-editor .margin {
    background-color: inherit;
  }
  .text-formated-container .monaco-editor-con .monaco-editor, 
  .text-formated-container .monaco-editor-con .monaco-editor-background, 
  .text-formated-container .monaco-editor-con .monaco-editor .inputarea.ime-input {
    background-color: inherit;
  }

  /*json key color*/
  .text-formated-container .monaco-editor-con .mtk4 {
    color: #111111;
  }
  .dark-mode .text-formated-container .monaco-editor-con .mtk4 {
    color: #ebebec;
  }
  /*json val string color*/
  .text-formated-container .monaco-editor-con .mtk5 {
    color: #42b983;
  }
  /*json val number color*/
  .text-formated-container .monaco-editor-con .mtk6 {
    color: #fc1e70;
  }
  /*json bracket color*/
  .text-formated-container .monaco-editor-con .mtk9 {
    color: #111111;
  }
  /*json bracket color*/
  .dark-mode .text-formated-container .monaco-editor-con .mtk9 {
    color: #b6b6b9;
  }

  /* common string in json editor*/
  .text-formated-container .monaco-editor-con .mtk1 {
    color: #606266;
  }
  .dark-mode .text-formated-container .monaco-editor-con .mtk1 {
    color: #f3f3f4;
  }
</style>
