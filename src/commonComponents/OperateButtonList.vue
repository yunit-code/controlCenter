<template>
  <div class="idm_lc_operate">
    <template v-for="(item, index) in commonButtonList">
      <div
        v-if="switchButtonShow(item, index)"
        :key="index"
        class="idm_lc_operate_common"
        :style="convertToStyleObjectBox(item, 'btnFont', 'btnLeftMargin')"
        @click="buttonClick(item, index)"
      >
        <i
          class="idm_lc_svgicon"
          :class="item.btnIcon"
          :style="
            convertToStyleObjectIcon(
              item,
              'btnIconColor',
              'btnIconSize',
              'btnIconLeftMargin'
            )
          "
          v-if="item.btnIcon"
          
        >
        </i>
        {{ item.btnTitle }}
      </div>
    </template>

    <a-dropdown v-if="MoreButtonList.length">
      <div
        class="idm_lc_operate_common idm_lc_operate_more"
        :style="
          convertToStyleObjectBox(
            commonButtonList.length
              ? commonButtonList[commonButtonList.length - 1]
              : MoreButtonList[0],
            'btnFont',
            'btnLeftMargin'
          )
        "
      >
        更多 <a-icon type="down" />
      </div>
      <a-menu slot="overlay">
        <template v-for="(item, index) in MoreButtonList">
          <a-menu-item :key="index" v-if="switchButtonShow(item, index)">
            <div
              class="idm_lc_operate_common"
              @click="buttonClick(item, index)"
              :style="convertToStyleObjectBox(item, 'btnFont', 'btnLeftMargin')"
            >
            
              <i
                :class="item.btnIcon"
                class="idm_lc_svgicon"
                :style="
                  convertToStyleObjectIcon(
                    item,
                    'btnIconColor',
                    'btnIconSize',
                    'btnIconLeftMargin'
                  )
                "
                v-if="item.btnIcon"
              >
              </i>
              {{ item.btnTitle }}
            </div>
          </a-menu-item>
        </template>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
export default {
  name: "OperateButtonList",
  data() {
    return {
      MoreButtonList: [],
      commonButtonList: [],
    };
  },
  props: {
    propData: {
      type: Object,
      default: () => {},
    },
    moduleObject: {
      type: Object,
      default: () => {},
    },
    itemData: {
      type: Object,
      default: () => {},
    },
    item: {
      type: Object,
      default: () => {},
    },
    componentData: {
      type: Object,
      default: () => [],
    },
    itemIndex: {
      type: Number,
    },
    componentEditStatus: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    let handleButtonList = [
      {
        btnTitle: "添加",
        btnLeftMargin: 10,
        btnIconColor: {},
        btnIconSize: 16,
        buttonHandleType: "insert",
        btnIcon: "",
        btnFont: {
          fontFamily: "",
          fontColors: {
            hex8: "#1890ffFF",
            hex: "#1890ff",
            rgba: {
              r: 24,
              g: 144,
              b: 255,
              a: 1,
            },
          },
          fontLetterSpacingUnit: "",
          fontLetterSpacing: "",
          fontSize: 14,
          fontSizeUnit: "px",
        },
      },
      {
        btnTitle: "删除",
        btnLeftMargin: 10,
        btnIconColor: {},
        btnIconSize: 24,
        buttonHandleType: "del",
        btnFont: {
          fontFamily: "",
          fontColors: {
            hex8: "#1890ffFF",
            hex: "#1890ff",
            rgba: {
              r: 24,
              g: 144,
              b: 255,
              a: 1,
            },
          },
          fontLetterSpacingUnit: "",
          fontLetterSpacing: "",
          fontSize: 14,
          fontSizeUnit: "px",
        },
      },
      {
        btnTitle: "上移",
        btnLeftMargin: 10,
        btnIconColor: {},
        btnIconSize: 24,
        buttonHandleType: "upsort",
        btnFont: {
          fontFamily: "",
          fontColors: {
            hex8: "#1890ffFF",
            hex: "#1890ff",
            rgba: {
              r: 24,
              g: 144,
              b: 255,
              a: 1,
            },
          },
          fontLetterSpacingUnit: "",
          fontLetterSpacing: "",
          fontSize: 14,
          fontSizeUnit: "px",
        },
      },
      {
        btnTitle: "下移",
        btnLeftMargin: 10,
        btnIconColor: {},
        btnIconSize: 24,
        buttonHandleType: "downsort",
        btnFont: {
          fontFamily: "",
          fontColors: {
            hex8: "#1890ffFF",
            hex: "#1890ff",
            rgba: {
              r: 24,
              g: 144,
              b: 255,
              a: 1,
            },
          },
          fontLetterSpacingUnit: "",
          fontLetterSpacing: "",
          fontSize: 14,
          fontSizeUnit: "px",
        },
      },
    ];
    if(this.propData.handleButtonList&&this.propData.handleButtonList.length){
      handleButtonList = this.propData.handleButtonList;
    }
    this.MoreButtonList = handleButtonList.filter(
      (item) => item.moveShowMoreDropDownList
    );
    this.commonButtonList = handleButtonList.filter(
      (item) => !item.moveShowMoreDropDownList
    );
  },
  methods: {
    /**
     * 判断按钮是否显示
     * @param {*} configObject
     * @param {*} configIndex
     */
    switchButtonShow(configObject, configIndex) {
      let result = true;
      if (
        configObject.showCustomFunction
      ) {
        result = typeof window[configObject.showCustomFunction]==="function"?window[configObject.showCustomFunction]({
          index: this.itemIndex,
          itemObject: this.itemData,
          configObject,
          configIndex,
          item:this.item,
        }):true;
      } else if (configObject.showCustomExpression) {
        result = IDM.express.replace(
          "@[" + configObject.showCustomExpression + "]",
          {
            index: this.itemIndex,
            itemObject: this.itemData,
            configObject,
            configIndex,
            item:this.item,
          }
        );
      }
      //至少保留一条数据清空下最后一条不允许删除
      if (
        this.propData.reserveOneData!==false &&
        this.componentData.length < 2 &&
        configObject.buttonHandleType == "del"
      ) {
        result = false;
      }
      //只读状态下控制能操作按钮都不能显示
      if (
        !this.componentEditStatus &&
        ["insert", "del", "upsort", "downsort"].includes(
          configObject.buttonHandleType
        )
      ) {
        result = false;
      }
      //第一条上不显示和最后一条下不显示
      if (
        (this.itemIndex == 0 && configObject.buttonHandleType == "upsort") ||
        (this.itemIndex == this.componentData.length - 1 &&
          configObject.buttonHandleType == "downsort")
      ) {
        result = false;
      }
      return result;
    },
    /**
     * 按钮点击事件
     * @param {*} configObject
     * @param {*} configIndex
     */
    buttonClick(configObject, configIndex) {
      let passFlag = true;
      if (
        configObject.beforeCustomFunction
      ) {
        passFlag = typeof window[configObject.beforeCustomFunction]==="function"?window[configObject.beforeCustomFunction]({
          index: this.itemIndex,
          itemObject: this.itemData,
          configObject,
          configIndex,
          item:this.item,
        }):true;
      }
      if (passFlag !== false) {
        this.$emit(
          "click",
          this.item,
          this.itemData,
          this.itemIndex,
          configObject,
          configIndex
        );
        //执行动作后的处理函数
        if (
          configObject.laterCustomFunction&&typeof window[configObject.laterCustomFunction]==="function"
        ) {
          window[configObject.laterCustomFunction]({
            index: this.itemIndex,
            itemObject: this.itemData,
            configObject,
            configIndex,
          });
        }
      }
    },
    /**
     * 公共样式转换方法
     */
    convertToStyleObjectBox(propData, font, leftMargin) {
      var styleObject = {};
      const allKey = [font, leftMargin];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case font:
              IDM.style.setFontStyle(styleObject, element);
              break;
            case leftMargin:
              styleObject["padding-left"] = element + "px";
              break;
          }
        }
      }
      return styleObject;
    },
    /**
     * 公共样式转换方法
     */
    convertToStyleObjectIcon(propData, iconColor, iconSize, iconLeftMargin) {
      var iconStyleObject = {};
      const allKey = [iconColor, iconSize, iconLeftMargin];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case iconColor:
              if (element && element.hex8) {
                iconStyleObject["color"] = IDM.hex8ToRgbaString(element.hex8);
              }
              break;
            case iconSize:
              iconStyleObject["font-size"] = element + "px";
              break;
            case iconLeftMargin:
              iconStyleObject["margin-right"] = element + "px";
              break;
          }
        }
      }
      return iconStyleObject;
    },
  },
};
</script>

<style lang="scss" scoped>
.idm_lc_operate_common {
  display: flex;
  align-items: center;
  cursor: pointer;
  .idm_lc_svgicon {
    fill: currentColor;
    vertical-align: middle;
  }
  &:hover {
    opacity: 0.9;
  }
}
.idm_lc_operate {
  display: flex;
  align-items: center;
}
</style>
