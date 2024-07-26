<template>
  <div
    class="el-autocomplete"
    v-clickoutside="close"
    aria-haspopup="listbox"
    role="combobox"
    :aria-expanded="suggestionVisible"
    :aria-owns="id"
  >
    <el-input
      ref="input"
      v-bind="[$props, $attrs]"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      @keydown.up.native.prevent="highlight(highlightedIndex - 1)"
      @keydown.down.native.prevent="highlight(highlightedIndex + 1)"
      @keydown.enter.native="handleKeyEnter"
      @keydown.native.tab="close"
    >
      <template slot="prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </template>
      <template slot="append" v-if="$slots.append">
        <slot name="append"></slot>
      </template>
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix" v-if="$slots.suffix">
        <slot name="suffix"></slot>
      </template>
    </el-input>
    <el-autocomplete-suggestions
      visible-arrow
      :class="[popperClass ? popperClass : '']"
      :popper-options="popperOptions"
      :append-to-body="popperAppendToBody"
      ref="suggestions"
      :placement="placement"
      :id="id"
    >
      <li
        v-for="(item, index) in suggestions"
        :key="index"
        :class="{ highlighted: highlightedIndex === index }"
        class="b-el-autocomplete-suggestion"
        @click="select(item)"
        :id="`${id}-item-${index}`"
        role="option"
        :aria-selected="highlightedIndex === index"
      >
        <slot :item="item"> {{ item[valueKey] }} </slot>
        <span
          v-if="$scopedSlots.suggestionSuffix"
          class="b-el-autocomplete-suggestion__suffix"
        >
          <slot name="suggestionSuffix" v-bind:suggestionItem="item"></slot>
        </span>
      </li>
    </el-autocomplete-suggestions>
  </div>
</template>
<script>
import { Autocomplete } from "element-ui";
export default {
  extends: Autocomplete,
};
</script>
<style type="text/css">
.b-el-autocomplete-suggestion {
  position: relative;
}
.b-el-autocomplete-suggestion .b-el-autocomplete-suggestion__suffix {
  position: absolute;
  height: 100%;
  right: 10px;
  top: 0;
  text-align: center;
  transition: all 0.3s;
}
</style>
