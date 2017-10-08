<template>
  <v-tabs light fixed centered v-model="active">
    <v-tabs-bar slot="activators" class="indigo">
      <v-tabs-slider class="yellow"></v-tabs-slider>
      <v-tabs-item
        v-for="(base, index) in bases"
        :key="index"
        :href="'#histories-tab-' + index"
      >
        {{ base }}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-content
      v-for="(base, index) in bases"
      :key="index"
      :id="'histories-tab-' + index"
    >
      <v-card flat>
        <v-data-table
            :headers="headers"
            :items="listHistories"
            class="elevation-1 text-xs-center"
          >
          <template slot="items" scope="props">
            <td class="text-xs-center">{{ props.item.vcType }}</td>
            <td class="text-xs-right">{{ props.item.units.toFixed(8) }}</td>
            <td class="text-xs-right">{{ props.item.rate.toFixed(8) }}</td>
            <td class="text-xs-right">{{ (props.item.units * props.item.rate).toFixed(8) }}</td>
            <td class="text-xs-center">{{ new Date(props.item.timestamp).toLocaleString() }}</td>
          </template>
        </v-data-table>
      </v-card>
    </v-tabs-content>
  </v-tabs>
</template>
<script>
  import axios from 'axios'
  export default {
    mounted () {
      this.loadHistoriesByBase(this.bases[0])
    },
    data () {
      return {
        histories: {},
        active: ''
      }
    },
    filters: {
    },
    computed: {
      bases () {
        return ['BTC']
      },
      headers () {
        return [
          { text: 'Coin', value: 'vcTye' },
          { text: 'Units', value: 'units' },
          { text: 'Rate', value: 'rate' },
          { text: 'Estimated Value', value: 'total' },
          { text: 'Datetime', value: 'timestamp' }
        ]
      },
      listHistories () {
        let result = []
        for (let vcType in this.histories) {
          this.histories[vcType].forEach(h => result.push(h))
        }
        result.sort((h1, h2) => h1.timestamp - h2.timestamp)
        return result
      }
    },
    methods: {
      loadHistoriesByBase (base) {
        axios.get(`/private/markets/poloniex/histories/${base}`).then(res => {
          this.histories = res.data
        }).catch(() => {})
      }
    }
  }
</script>
<style scoped lang="less">
</style>