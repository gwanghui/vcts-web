import Vue from 'vue'
import Vuetify from 'vuetify'
import Assets from '@/containers/Assets'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('containers/Assets', function () {
  let vm
  let mockAxios
  before(() => {
    mockAxios = new MockAdapter(axios)
    mockAxios.onGet('/private/markets/poloniex/assets/BTC').reply(200, {
      BTC: [
        {
          base: 'BTC',
          vcType: 'BTC',
          units: 0.4,
          rate: 1
        }
      ]
    })
    mockAxios.onGet('/private/markets/poloniex/tickers/BTC').reply(200, {
      ETH: {
        base: 'BTC',
        vcType: 'ETH',
        'bid': 0.06888222,
        'ask': 0.06901976,
        'timestamp': 1507474614729
      }
    })
    mockAxios.onDelete('/private/markets/poloniex/assets/BTC/ETH/1').reply(200, Promise.resolve({
      base: 'BTC',
      vcType: 'ETH',
      uuid: '1'
    }))
    mockAxios.onPut('/private/markets/poloniex/assets/BTC/ETH?mode=merge').reply(200, Promise.resolve({
      base: 'BTC',
      vcType: 'ETH',
      uuid: '1'
    }))
    Vue.use(Vuetify)
    const Constructor = Vue.extend(Assets)
    vm = new Constructor().$mount()
  })
  after(() => {
    mockAxios.restore()
  })
  describe('computed', () => {
    it('should return sorted bases array when bases', () => {
      let bases = vm.bases
      expect(bases.length).to.equal(1)
      expect(bases[0]).to.equal('BTC')
    })
    describe('listSummaries', () => {
      before(() => {
        vm.assets = {
          'ETH': [
            {
              'base': 'BTC',
              'vcType': 'ETH',
              'units': 1,
              'rate': 0.1
            },
            {
              'base': 'BTC',
              'vcType': 'ETH',
              'units': 1,
              'rate': 0.2
            }
          ],
          'BTC': [
            {
              base: 'BTC',
              vcType: 'BTC',
              units: 0.4,
              rate: 1
            }
          ]
        }
      })
      it('should return array of asset that has sum of units and average of rate when it call', () => {
        let arr = vm.listSummaries
        expect(arr.length).to.equal(2)
        expect(arr[0].units).to.equal(2)
        expect(arr[0].rate.toFixed(2)).to.equal('0.15')
        expect(arr[1].units.toFixed(1)).to.equal('0.4')
        expect(arr[1].rate).to.equal(1)
      })
      it('should return array that included bid when it call', () => {
        let arr = vm.listSummaries
        expect(arr[1].change).to.exist
      })
    })
    describe('showControlBox', () => {
      it('return true when selectedAssets.ids.length > 0', () => {
        vm.selectedAssets = {
          vcType: 'BTC',
          ids: [1]
        }
        expect(vm.showControlBox).to.be.true
      })
      it('return false when selectedAssets.ids.length === 0', () => {
        vm.selectedAssets = {
          vcType: 'BTC',
          ids: []
        }
        expect(vm.showControlBox).to.be.false
      })
    })
  })
  describe('methods', () => {
    describe('loadAssetsByBase', () => {
      it('should set to assets when it call', done => {
        vm.loadAssetsByBase('BTC')
        setTimeout(() => {
          expect(vm.assets.BTC[0].units).to.equal(0.4)
          done()
        }, 100)
      })
    })
    describe('loadTickersByBase', () => {
      it('should set to tickers when it call', done => {
        vm.loadTickersByBase('BTC')
        setTimeout(() => {
          expect(vm.tickers.ETH.bid).to.equal(0.06888222)
          done()
        }, 100)
      })
    })
    describe('onClickAsset', () => {
      it('should be added asset to selectedAssets when it calls', () => {
        vm.selectedAssets = {
          vcType: 'BTC',
          ids: ['1', '2', '3']
        }
        vm.onClickAsset('BTC', 'id-0')
        expect(vm.selectedAssets.vcType).to.equal('BTC')
        expect(vm.selectedAssets.ids.length).to.equal(4)
        expect(vm.selectedAssets.ids[3]).to.equal('id-0')
      })
      it('should be initialize selectedAssets when vcType is not matched', () => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1', '2', '3']
        }
        vm.onClickAsset('BTC', 'id-0')
        expect(vm.selectedAssets.vcType).to.equal('BTC')
        expect(vm.selectedAssets.ids.length).to.equal(1)
        expect(vm.selectedAssets.ids[0]).to.equal('id-0')
      })
      it('should remove uuid when it already added', () => {
        vm.selectedAssets = {
          vcType: 'BTC',
          ids: ['1', 'id-0']
        }
        vm.onClickAsset('BTC', 'id-0')
        expect(vm.selectedAssets.vcType).to.equal('BTC')
        expect(vm.selectedAssets.ids.length).to.equal(1)
        expect(vm.selectedAssets.ids[0]).to.equal('1')
      })
    })
    describe('onClickSummary', () => {
      it('should not be changed when vcType is matched', () => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1', '2', '3']
        }
        vm.onClickSummary('ETH')
        expect(vm.selectedAssets.vcType).to.equal('ETH')
        expect(vm.selectedAssets.ids.length).to.equal(3)
      })
      it('should be initialize selectedAssets when vcType is not matched', () => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1', '2', '3']
        }
        vm.onClickSummary('BTC')
        expect(vm.selectedAssets.vcType).to.equal('BTC')
        expect(vm.selectedAssets.ids.length).to.equal(0)
      })
    })
    describe('onClickRemove', () => {
      it('should reload assets when it calls', done => {
        vm.assets = {}
        vm.onClickRemove()
        setTimeout(() => {
          expect(vm.assets.BTC.length).to.equal(1)
          done()
        }, 100)
      })
      it('should reset selectedAssets when it calls', done => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1']
        }
        vm.onClickRemove()
        setTimeout(() => {
          expect(vm.selectedAssets.vcType).to.equal('')
          expect(vm.selectedAssets.ids.length).to.equal(0)
          done()
        }, 100)
      })
    })
    describe('onClickMerge', () => {
      it('should reload assets when it calls', done => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1', '2']
        }
        vm.assets = {}
        vm.onClickMerge()
        setTimeout(() => {
          expect(vm.assets.BTC.length).to.equal(1)
          done()
        }, 100)
      })
      it('should reset selectedAssets when it calls', done => {
        vm.selectedAssets = {
          vcType: 'ETH',
          ids: ['1', '2']
        }
        vm.onClickMerge()
        setTimeout(() => {
          expect(vm.selectedAssets.vcType).to.equal('')
          expect(vm.selectedAssets.ids.length).to.equal(0)
          done()
        }, 100)
      })
    })
  })
})
