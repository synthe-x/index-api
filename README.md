

decoded data LogDescription {
  eventFragment: {
    name: 'NewMinCRatio',
    anonymous: false,
    inputs: [ [ParamType] ],
    type: 'event',
    _isFragment: true,
    constructor: [Function: EventFragment] {
      from: [Function (anonymous)],
      fromObject: [Function (anonymous)],
      fromString: [Function (anonymous)],
      isEventFragment: [Function (anonymous)]
    },
    format: [Function (anonymous)]
  },
  name: 'NewMinCRatio',
    name: 'NewSafeCRatio',
    anonymous: false,
    inputs: [ [ParamType] ],
    type: 'event',
    _isFragment: true,
    constructor: [Function: EventFragment] {
      from: [Function (anonymous)],
      fromObject: [Function (anonymous)],
      fromString: [Function (anonymous)],
      isEventFragment: [Function (anonymous)]
    },
    format: [Function (anonymous)]
  },
  name: 'NewSafeCRatio',
  signature: 'NewSafeCRatio(uint256)',
  topic: '0xc35ae6a1edee94fd166ea436648714082ffa14fa1b97c879a63efec918342bd4',
  args: [
    safeCRatio: BigNumber { _hex: '0x1d24b2dfac520000', _isBigNumber: true }
  ]
}

////////////////////////////////////////////////////////////////////////////////////////////

decoded data LogDescription {
  eventFragment: {
    name: 'NewTradingPool',
    anonymous: false,
    inputs: [ [ParamType], [ParamType] ],
    type: 'event',
    _isFragment: true,
    constructor: [Function: EventFragment] {
      from: [Function (anonymous)],
      fromObject: [Function (anonymous)],
      fromString: [Function (anonymous)],
      isEventFragment: [Function (anonymous)]
    },
    format: [Function (anonymous)]
  },
  name: 'NewTradingPool',
  signature: 'NewTradingPool(address,uint256)',
  topic: '0xe64854a98646ec160228627fb369a73d5469e5d784e1a519d723c2b632702967',
  args: [
    '0x683EE2f8aBE65eDF2a164044e34D1cfac15d7480',
    BigNumber { _hex: '0x01', _isBigNumber: true },
    pool: '0x683EE2f8aBE65eDF2a164044e34D1cfac15d7480',
    poolId: BigNumber { _hex: '0x01', _isBigNumber: true }
  ]
}

////////////////////////////////////////////////////////////////////////////////////////

decoded data LogDescription {
  eventFragment: {
    name: 'NewSynthAsset',
    anonymous: false,
    inputs: [ [ParamType], [ParamType], [ParamType] ],
    type: 'event',
    _isFragment: true,
    constructor: [Function: EventFragment] {
      from: [Function (anonymous)],
      fromObject: [Function (anonymous)],
      fromString: [Function (anonymous)],
      isEventFragment: [Function (anonymous)]
    },
    format: [Function (anonymous)]
  },
  name: 'NewSynthAsset',
  signature: 'NewSynthAsset(address,address,address)',
  topic: '0x29cc73fb1338d03efc29ba5cefa1a64776ef61ec6d9baf5c75dcd8b30780a5b4',
  args: [
    '0xD7058160AcCD367407CD675b9Fd0385d2C1204cd',
    '0x6228Eb2C062A8d56F5A695e8Ee5e2D4427b5F897',
    '0x9aB10df0b31F1C9dEB19f0B43a190b9377c356de',
    asset: '0xD7058160AcCD367407CD675b9Fd0385d2C1204cd',
    priceOracle: '0x6228Eb2C062A8d56F5A695e8Ee5e2D4427b5F897',
    interestRateModel: '0x9aB10df0b31F1C9dEB19f0B43a190b9377c356de'
  ]
}

//////////////////////////////////////////////////////////////////