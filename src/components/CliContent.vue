<template>
  <div class="cli-content-container">
    <!-- monaco editor div -->
    <div class="monaco-editor-con" ref="editor"></div>
  </div>
</template>

<script type="text/javascript">
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default {
  props: {
    content: {type: String, default: () => {}},
  },
  created() {
    // listen font family change and reset options
    // to avoid cursor offset
    this.$bus.$on('fontInited', this.changeFont);
  },
  watch: {
    // refresh
    content(newVal) {
      this.monacoEditor.setValue(newVal);
    },
  },
  methods: {
    changeFont(fontFamily) {
      this.monacoEditor && this.monacoEditor.updateOptions({
        fontFamily: fontFamily,
      });
    },
    scrollToBottom() {
      this.monacoEditor.revealLine(this.monacoEditor.getModel().getLineCount())
    },
  },

  mounted() {
    this.monacoEditor = monaco.editor.create(
      this.$refs.editor,
      {
        value: this.content,
        theme: 'vs-dark',
        language: "plaintext",
        links: false,
        readOnly: true,
        cursorStyle: 'underline-thin',
        lineNumbers: 'off',
        contextmenu: false,
        // set fontsize and family to avoid cursor offset
        fontSize: 14,
        fontFamily: this.$storage.getFontFamily(),
        showFoldingControls: 'always',
        // auto layout, performance cost
        automaticLayout: true,
        wordWrap: 'on',
        // wordWrapColumn: 120,
        // long text indent when wrapped
        wrappingIndent: 'none',
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

    // hide tooltip in readonly mode
    const messageContribution = this.monacoEditor.getContribution('editor.contrib.messageController');
    this.monacoEditor.onDidAttemptReadOnlyEdit(() => {
      messageContribution.dispose();
    });
  },
  destroyed() {
    this.monacoEditor.dispose();
    this.$bus.$off('fontInited', this.changeFont);
  },
}
</script>

<style type="text/css">
  .cli-content-container .monaco-editor-con {
    min-height: 150px;
    height: calc(100vh - 160px);
    clear: both;
    overflow: hidden;
    background: #263238;
    border: 1px solid #e4e7ed;
    border-bottom: 0px;
    border-radius: 4px 4px 0 0;
  }
  .dark-mode .cli-content-container .monaco-editor-con {
    background: #324148;
    border-color: #7f8ea5;
  }

  /* font color*/
  .cli-content-container .monaco-editor-con .mtk1 {
    color: #d3d5d9;
  }
  .dark-mode .cli-content-container .monaco-editor-con .mtk1 {
    color: #e8e8e8;
  }

  /*hide cursor*/
  .cli-content-container .monaco-editor .cursors-layer > .cursor {
    display: none !important;
  }

  /*change default scrollbar style*/
  .cli-content-container .monaco-editor .scrollbar {
    background: #eaeaea;
    border-radius: 4px;
  }
  .dark-mode .cli-content-container .monaco-editor .scrollbar {
    background: #425057;
  }
  .cli-content-container .monaco-editor .scrollbar:hover {
    background: #e0e0dd;
  }
  .dark-mode .cli-content-container .monaco-editor .scrollbar:hover {
    background: #495961;
  }

  .cli-content-container .monaco-editor-con .monaco-editor .slider {
    border-radius: 4px;
    background: #c1c1c1;
  }
  .dark-mode .cli-content-container .monaco-editor-con .monaco-editor .slider {
    background: #5a6f7a;
  }
  .cli-content-container .monaco-editor-con .monaco-editor .slider:hover {
    background: #7f7f7f;
  }
  .dark-mode .cli-content-container .monaco-editor-con .monaco-editor .slider:hover {
    background: #6a838f;
  }

  /*remove background color*/
  .cli-content-container .monaco-editor .margin {
    background-color: inherit;
  }

  .cli-content-container .monaco-editor-con .monaco-editor, 
  .cli-content-container .monaco-editor-con .monaco-editor-background, 
  .cli-content-container .monaco-editor-con .monaco-editor .inputarea.ime-input {
    background-color: inherit;
  }
</style>
