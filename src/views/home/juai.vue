<template>
  <div class="home-container layout-pd">
    <el-text tag="b">用户统计</el-text>
    <el-skeleton v-if="state.s_users_loading" :rows="4" />
    <el-row :gutter="15" class="home-card-one mb15">
      <el-col
        style="margin-top: 10px"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
        v-for="(v, k) in state.s_users"
        :key="k"
        :class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k == 1 }"
      >
        <div class="home-card-item flex">
          <div class="flex-margin flex w100" :class="` home-one-animation${k}`">
            <div class="flex-auto">
              <span class="font30">{{ v.value }}</span>
              <div class="mt10">{{ v.key }}</div>
            </div>
            <div
              class="home-card-item-icon flex"
              :style="{ background: `var(--next-color-success-lighter)` }"
            >
              <i
                class="flex-margin font32 fa fa-user"
                :style="{ color: `var(--el-color-success)` }"
              ></i>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <br />
    <el-text tag="b">内容统计</el-text>
    <el-skeleton v-if="state.s_contents_loading" :rows="4" />
    <el-row :gutter="15" class="home-card-one mb15">
      <el-col
        style="margin-top: 10px"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
        v-for="(v, k) in state.s_contents"
        :key="k"
        :class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
      >
        <div class="home-card-item flex">
          <div class="flex-margin flex w100" :class="` home-one-animation${k}`">
            <div class="flex-auto">
              <span class="font30">{{ v.value }}</span>
              <div class="mt10">{{ v.key }}</div>
            </div>
            <div
              class="home-card-item-icon flex"
              :style="{ background: `var(--next-color-primary-lighter)` }"
            >
              <i
                class="flex-margin font32 fa fa-outdent"
                :style="{ color: `var(--el-color-primary)` }"
              ></i>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <br />
    <el-text tag="b">AI内容统计</el-text>
    <el-skeleton v-if="state.s_ais_loading" :rows="4" />
    <el-row :gutter="15" class="home-card-one mb15">
      <el-col
        style="margin-top: 10px"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
        v-for="(v, k) in state.s_ais"
        :key="k"
        :class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
      >
        <div class="home-card-item flex">
          <div class="flex-margin flex w100" :class="` home-one-animation${k}`">
            <div class="flex-auto">
              <span class="font30">{{ v.value }}</span>
              <div class="mt10">{{ v.key }}</div>
            </div>
            <div
              class="home-card-item-icon flex"
              :style="{ background: `var(--next-color-warning-lighter)` }"
            >
              <i
                class="flex-margin font32 fa fa-cube"
                :style="{ color: `var(--el-color-warning)` }"
              ></i>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <br />
    <el-text tag="b">充值统计</el-text>
    <el-skeleton v-if="state.s_pays_loading" :rows="4" />
    <el-row :gutter="15" class="home-card-one mb15">
      <el-col
        style="margin-top: 10px"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
        v-for="(v, k) in state.s_pays"
        :key="k"
        :class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
      >
        <div class="home-card-item flex">
          <div class="flex-margin flex w100" :class="` home-one-animation${k}`">
            <div class="flex-auto">
              <span class="font30">{{ v.value }}</span>
              <div class="mt10">{{ v.key }}</div>
            </div>
            <div
              class="home-card-item-icon flex"
              :style="{ background: `var(--next-color-danger-lighter)` }"
            >
              <i
                class="flex-margin font32 fa fa-money"
                :style="{ color: `var(--el-color-danger)` }"
              ></i>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="home">
import { reactive, onMounted, onActivated } from "vue";
import { getHomeAi, getHomeContent, getHomePay, getHomeUser } from "/@/api/main/home";
interface statistic {
  key: string;
  value: string;
}
const state = reactive({
  global: {
    homeChartOne: null,
    homeChartTwo: null,
    homeCharThree: null,
    dispose: [null, "", undefined],
  } as any,
  s_users: Array<statistic>(),
  s_users_loading: true,
  s_contents: Array<statistic>(),
  s_contents_loading: true,
  s_ais: Array<statistic>(),
  s_ais_loading: true,
  s_pays: Array<statistic>(),
  s_pays_loading: true,
});
// 页面加载时
onMounted(() => {
  getHomeUser().then(
    (res) => ((state.s_users = res.data.result), (state.s_users_loading = false))
  );
  getHomeContent().then(
    (res) => ((state.s_contents = res.data.result), (state.s_contents_loading = false))
  );
  getHomeAi().then(
    (res) => ((state.s_ais = res.data.result), (state.s_ais_loading = false))
  );
  getHomePay().then(
    (res) => ((state.s_pays = res.data.result), (state.s_pays_loading = false))
  );
});
// 由于页面缓存原因，keep-alive
onActivated(() => {});
</script>

<style scoped lang="scss">
$homeNavLengh: 8;

.home-container {
  overflow: hidden;

  .home-card-one,
  .home-card-two,
  .home-card-three {
    .home-card-item {
      width: 100%;
      height: 130px;
      border-radius: 4px;
      transition: all ease 0.3s;
      padding: 20px;
      overflow: hidden;
      background: var(--el-color-white);
      color: var(--el-text-color-primary);
      border: 1px solid var(--next-border-color-light);

      &:hover {
        box-shadow: 0 2px 12px var(--next-color-dark-hover);
        transition: all ease 0.3s;
      }

      &-icon {
        width: 70px;
        height: 70px;
        border-radius: 100%;
        flex-shrink: 1;

        i {
          color: var(--el-text-color-placeholder);
        }
      }

      &-title {
        font-size: 15px;
        font-weight: bold;
        height: 30px;
      }
    }
  }

  .home-card-one {
    @for $i from 0 through 3 {
      .home-one-animation#{$i} {
        opacity: 0;
        animation-name: error-num;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
        animation-delay: calc($i/4) + s;
      }
    }
  }

  .home-card-two,
  .home-card-three {
    .home-card-item {
      height: 400px;
      width: 100%;
      overflow: hidden;

      .home-monitor {
        height: 100%;

        .flex-warp-item {
          width: 25%;
          height: 111px;
          display: flex;

          .flex-warp-item-box {
            margin: auto;
            text-align: center;
            color: var(--el-text-color-primary);
            display: flex;
            border-radius: 5px;
            background: var(--next-bg-color);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--el-color-primary-light-9);
              transition: all 0.3s ease;
            }
          }

          @for $i from 0 through $homeNavLengh {
            .home-animation#{$i} {
              opacity: 0;
              animation-name: error-num;
              animation-duration: 0.5s;
              animation-fill-mode: forwards;
              animation-delay: calc($i/10) + s;
            }
          }
        }
      }
    }
  }
}
</style>
