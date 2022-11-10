# Syntex

## Backend APIS

### 1. For fetching volumes of pool by its id

### Route /pool/volume/:pool_id

### Expected Input
```
Method : Get
Url : http://localhost:3030/pool/volume/3
where pool_id can be 0 to 5 only
```

### Expected Output 

```
{
    "status": true,
    "data": [
        {
            "dayId": "19284",
            "USDX": "0",
            "EURX": "1.2577319587628866",
            "YENX": "0",
            "INRX": "0"
        },
        {
            "dayId": "19285",
            "USDX": "1.22",
            "EURX": "0",
            "YENX": "126521.73913043478",
            "INRX": "0"
        }
    ]
}
```

### 2. For fetching all pools details

### Route /pool/all

### Expected Input
```
Method : Get
Url : http://localhost:3030/pool/all
```

### Expected Output 

```
{
    "status": true,
    "data": [
        {
            "pool_id": "1",
            "pool_address": "TPhFcs29MzxZ2AuQ7DyQiEidhGfgjeZZ4G",
            "name": "SyntheX All Rounder",
            "symbol": "SYXAR",
            "poolSynth_ids": [
                {
                    "synth_id": "636cec4479a1f54029722311",
                    "balance": "7.319924860699945e+21",
                    "name": "SyntheX US Dollar",
                    "symbol": "USDX",
                    "price": "1"
                },
                {
                    "synth_id": "636cec4479a1f54029722312",
                    "balance": "52351528173940040",
                    "name": "SyntheX Bitcoin",
                    "symbol": "BTCX",
                    "price": "19099.92"
                },
                ...               
            ]
        },
        {
            "pool_id": "2",
            "pool_address": "TDnSrqumErjad6bEVp3szgc5Cf2LXxi4wJ",
            "name": "Crypto Markets",
            "symbol": "CRYPT",
            "poolSynth_ids": [
                {
                    "synth_id": "636cec4479a1f54029722333",
                    "balance": "2022836177147904",
                    "name": "SyntheX Bitcoin",
                    "symbol": "BTCX",
                    "price": "19099.92"
                },
                {
                    "synth_id": "636cec4479a1f54029722334",
                    "balance": "2012584145354230800",
                    "name": "SyntheX Ethereum",
                    "symbol": "ETHX",
                    "price": "1234.14"
                },
                ...
            ]
        },
        ...
              
    ]
}
```
### 3. For fetching all collaterals details

### Route /assets/collaterals

### Expected Input
```
Method : Get
Url : http://localhost:3030/assets/collaterals
```

### Expected Output 

```
{
    "status": true,
    "data": [
        {
            "coll_address": "TJE8C3ZhnxrQAL69D5C6C5fQFNitrTKqZD",
            "name": "Wrapped TRX",
            "symbol": "WTRX",
            "price": "0.0671",
            "decimal": "6",
            "minCollateral": 10000000,
            "cAsset": "TUPZdPwG4hf4qFFXPQ6qruTHTm9pCzjsw8",
            "liquidity": "5087623000000"
        },
        {
            "coll_address": "TFT7sNiNDGZcqL7z7dwXUPpxrx1Ewk8iGL",
            "name": "Decentralized USD",
            "symbol": "USDD",
            "price": "0.998",
            "decimal": "18",
            "minCollateral": 1000000000000000000,
            "cAsset": "TABQScfGK98wrnvPvEYjQjdPmQtYqq4kAB",
            "liquidity": "0"
        }
    ]
}
```

### 4. For fetching all synthetic assets details

### Route /assets/synths

### Expected Input
```
Method : Get
Url : http://localhost:3030/assets/synths
```

### Expected Output 

```
{
    "status": true,
    "data": [
        {
            "synth_id": "TTRVu13PeWdHJLYjzNV7hALp9MhHfcE9K9",
            "name": "SyntheX US Dollar",
            "symbol": "USDX",
            "price": "1",
            "borrowIndex": "1000639397627374900",
            "interestRateModel": "0xd732400c50c8da59c7c2b9b72058e6d9789f881c",
            "totalBorrowed": "3.693360151687078e+21",
            "decimal": "18",
            "apy": "0.010050230216830824",
            "liquidity": 1.1024557794793968e+22
        },
        {
            "synth_id": "TY5cfoZoLs1DzHVjE4PNgVUH9o9f4UT2qN",
            "name": "SyntheX Bitcoin",
            "symbol": "BTCX",
            "price": "19099.92",
            "borrowIndex": "1000639356206884637",
            "interestRateModel": "0xd732400c50c8da59c7c2b9b72058e6d9789f881c",
            "totalBorrowed": "500526041649270140",
            "decimal": "18",
            "apy": "0.010050230216830824",
            "liquidity": 554900406000358100
        },
       ...
    ]
}
```


### 5. For fetching system details

### Route /system

### Expected Input
```
Method : Get
Url : http://localhost:3030/system
```

### Expected Output 

```
{
    "status": true,
    "data": {
        "minCollateralRatio": "130",
        "safeCollateralRatio": "200",
        "blockNumber": 31459331
    }
}
```
