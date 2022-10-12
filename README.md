

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


decoded data Exchange {
  txn_id: '7cf19d2fc3aa8258305acc1f56fcc55f700f6481ed66f
ad6b2840b0bb7281bc7',
  block_timestamp: '1665554823000',
  block_number: '30624126',
  index: 3,
  address: '0x5b7a14d93db1325b21d0da6bceaf5ac0454a7384' 
} LogDescription {
  eventFragment: {
    name: 'Exchange',
    anonymous: false,
    inputs: [ [ParamType], [ParamType], [ParamType], [Pa
ramType], [ParamType] ],
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
  name: 'Exchange',
  signature: 'Exchange(uint256,address,address,uint256,a
ddress)',
  topic: '0xc7abb3d8af17d2db489ffd7513969405b9aa490af2ed
e6b24a9c151042c95edd',
  args: [
    BigNumber { _hex: '0x01', _isBigNumber: true },     
    '0xC4Fd26C420b8b5D0a5DC09AD45169e21643D5e17',       
    '0xc598901d393F8908ce61840e51D795daF9660677',       
    BigNumber { _hex: '0x8ac7230489e80000', _isBigNumber
: true },
    '0x81bA84f0830af162a578A7E3844F1B99E7c40075',       
    pool: BigNumber { _hex: '0x01', _isBigNumber: true }
,
    account: '0xC4Fd26C420b8b5D0a5DC09AD45169e21643D5e17
',
    src: '0xc598901d393F8908ce61840e51D795daF9660677',  
    srcAmount: BigNumber { _hex: '0x8ac7230489e80000', _
isBigNumber: true },
    dst: '0x81bA84f0830af162a578A7E3844F1B99E7c40075'   
  ]
}


////////////////////////////////////////////////////////////////

PoolEntered LogDescription {
  eventFragment: {
    name: 'PoolEntered',
    anonymous: false,
    inputs: [ [ParamType], [ParamType], [ParamType], [P
aramType] ],
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
  name: 'PoolEntered',
  signature: 'PoolEntered(address,address,address,uint2
56)',
  topic: '0xe5ca6288535c5c6c2462c912b4033eade15b8092671
7896a2d58a2defdeb9128',
  args: [
    '0x660619C4f5bb68650EBB3F8458fDB97F27b965EE',      
    '0xC4Fd26C420b8b5D0a5DC09AD45169e21643D5e17',      
    '0xc598901d393F8908ce61840e51D795daF9660677',      
    BigNumber { _hex: '0x3635c9adc5dea00000', _isBigNum
ber: true },
    pool: '0x660619C4f5bb68650EBB3F8458fDB97F27b965EE',
    account: '0xC4Fd26C420b8b5D0a5DC09AD45169e21643D5e1
7',
    asset: '0xc598901d393F8908ce61840e51D795daF9660677'
,
    amount: BigNumber { _hex: '0x3635c9adc5dea00000', _
isBigNumber: true }
  ]
}