<template>
  <div
    class="idm_lc_footerbox"
    v-if="(propData.showAddNewBtn!==false && addNewIsShow) || propData.showTooltip===true"
  >
    <a-button
      class="idm_lc_addnewbtn"
      @click="addComponentData"
      v-if="propData.showAddNewBtn!==false && addNewIsShow"
      :type="propData.addNewBtnType || 'primary'"
      :size="propData.addNewBtnSize || 'default'"
      :shape="propData.addNewBtnShape||'default'"
    >
      <i
        class="idm_lc_svgicon"
        :class="propData.addNewIcon"
        v-if="propData.addNewIcon"
      >
      </i>
      {{ propData.addNewTitle || "新增一条" }}
    </a-button>
    <div class="idm_lc_desc" v-if="propData.showTooltip===true">
      <i
        class="idm_lc_svgicon"
        :class="propData.tooltipIcon"
        v-if="propData.tooltipIcon"
      >
      </i>
      <span v-html="getAddDescText()"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddNewButton",
  data() {
    return {
      addNewIsShow: true,
    };
  },
  props: {
    propData: {
      type: Object,
      default: () => {},
    },
  },
  created() {
    if (
      this.propData.addNewShowCustomFunction
    ) {
      this.addNewIsShow = typeof window[this.propData.addNewShowCustomFunctione]==="function"?window[this.propData.addNewShowCustomFunction]({
          
        }):true;
    }
  },
  methods: {
    addComponentData() {
      let passFlag = true;
      if (
        this.propData.addNewBeforeCustomFunction
      ) {
        passFlag = typeof window[this.propData.addNewBeforeCustomFunction]==="function"?window[this.propData.addNewBeforeCustomFunction]({
          
        }):true;
      }
      if (passFlag !== false) {
        this.$emit("click", this);
        if (
          this.propData.addNewLaterCustomFunction&&typeof window[this.propData.addNewLaterCustomFunction]==="function"
        ) {
          window[this.propData.addNewLaterCustomFunction]({
          });
        }
      }
    },
    /**
     * 获取行的标题
     * @param {*} index
     */
    getAddDescText() {
      let title = this.propData.tooltipTitle;
      if (
        this.propData.tooltipTextShowCustomFunction&&typeof window[this.propData.tooltipTextShowCustomFunction]==="function"
      ) {
        title = window[this.propData.tooltipTextShowCustomFunction]({
          
        });
      }
      return title;
    },
  },
};
</script>

<style lang="scss" scoped></style>
