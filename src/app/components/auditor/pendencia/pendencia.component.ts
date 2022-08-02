import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'fc-pendencia',
  templateUrl: './pendencia.component.html',
  styleUrls: ['./pendencia.component.scss']
})
export class PendenciaComponent implements OnInit {

  test_data = [
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,421",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO P/S",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "AVIAMENTO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1001659",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 20 CRU .",
          "QT_CONSUMOUNIT": "0.66"
        },
        {
          "CD_PRODUTO_MP": "1002548",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 8 CRU .",
          "QT_CONSUMOUNIT": "0.42"
        },
        {
          "CD_PRODUTO_MP": "1005554",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO EXPORTACAO BRANCO U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1009908",
          "DS_PRODUTO_MP": "PONTEIRA EMBORRACHADA PC 7672 PRETO .",
          "QT_CONSUMOUNIT": "2"
        },
        {
          "CD_PRODUTO_MP": "1010439",
          "DS_PRODUTO_MP": "ETIQUETA SILICONE LABELAMAFIA 18.20.1106 TRANSPARENTE .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1011434",
          "DS_PRODUTO_MP": "ETIQUETA ETIQUETA METAL / ACRILICA LABELLA ROSA U",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,421",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO P/S",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "EMBALAGEM",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1000027",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO ARGOX 34X120MM BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000051",
          "DS_PRODUTO_MP": "ETIQUETA TAG COUCHE CARTAO BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000369",
          "DS_PRODUTO_MP": "TAG PINO FIX-PIN 80MM NEUTRO . U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000374",
          "DS_PRODUTO_MP": "SACO PLASTICO PP C/ABA ADESIVA 25X35X0,07 INCOLOR U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1004380",
          "DS_PRODUTO_MP": "TAG 5X20 CINZA/AMARELO .",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,421",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO P/S",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "TECIDO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "1.735"
        },
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "23"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,422",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO M/M",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "AVIAMENTO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1001659",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 20 CRU .",
          "QT_CONSUMOUNIT": "0.72"
        },
        {
          "CD_PRODUTO_MP": "1002548",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 8 CRU .",
          "QT_CONSUMOUNIT": "0.42"
        },
        {
          "CD_PRODUTO_MP": "1005554",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO EXPORTACAO BRANCO U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1009908",
          "DS_PRODUTO_MP": "PONTEIRA EMBORRACHADA PC 7672 PRETO .",
          "QT_CONSUMOUNIT": "2"
        },
        {
          "CD_PRODUTO_MP": "1010439",
          "DS_PRODUTO_MP": "ETIQUETA SILICONE LABELAMAFIA 18.20.1106 TRANSPARENTE .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1011434",
          "DS_PRODUTO_MP": "ETIQUETA ETIQUETA METAL / ACRILICA LABELLA ROSA U",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,422",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO M/M",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "EMBALAGEM",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1000027",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO ARGOX 34X120MM BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000051",
          "DS_PRODUTO_MP": "ETIQUETA TAG COUCHE CARTAO BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000369",
          "DS_PRODUTO_MP": "TAG PINO FIX-PIN 80MM NEUTRO . U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000374",
          "DS_PRODUTO_MP": "SACO PLASTICO PP C/ABA ADESIVA 25X35X0,07 INCOLOR U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1004380",
          "DS_PRODUTO_MP": "TAG 5X20 CINZA/AMARELO .",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,422",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO M/M",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "TECIDO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "23"
        },
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "1.735"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,423",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO G/L",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "AVIAMENTO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1001659",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 20 CRU .",
          "QT_CONSUMOUNIT": "0.78"
        },
        {
          "CD_PRODUTO_MP": "1002548",
          "DS_PRODUTO_MP": "ELASTICO JARAGUA 8 CRU .",
          "QT_CONSUMOUNIT": "0.42"
        },
        {
          "CD_PRODUTO_MP": "1005554",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO EXPORTACAO BRANCO U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1009908",
          "DS_PRODUTO_MP": "PONTEIRA EMBORRACHADA PC 7672 PRETO .",
          "QT_CONSUMOUNIT": "2"
        },
        {
          "CD_PRODUTO_MP": "1010439",
          "DS_PRODUTO_MP": "ETIQUETA SILICONE LABELAMAFIA 18.20.1106 TRANSPARENTE .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1011434",
          "DS_PRODUTO_MP": "ETIQUETA ETIQUETA METAL / ACRILICA LABELLA ROSA U",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,423",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO G/L",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "EMBALAGEM",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1000027",
          "DS_PRODUTO_MP": "ETIQUETA COMPOSICAO ARGOX 34X120MM BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000051",
          "DS_PRODUTO_MP": "ETIQUETA TAG COUCHE CARTAO BRANCO .",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000369",
          "DS_PRODUTO_MP": "TAG PINO FIX-PIN 80MM NEUTRO . U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1000374",
          "DS_PRODUTO_MP": "SACO PLASTICO PP C/ABA ADESIVA 25X35X0,07 INCOLOR U",
          "QT_CONSUMOUNIT": "1"
        },
        {
          "CD_PRODUTO_MP": "1004380",
          "DS_PRODUTO_MP": "TAG 5X20 CINZA/AMARELO .",
          "QT_CONSUMOUNIT": "1"
        }
      ]
    },
    {
      "NR_CICLO": "1,571",
      "NR_OP": "9",
      "CD_REFERENCIA": "26800",
      "CD_PRODUTO": "71,423",
      "DS_PRODUTO": "SAIA ECCENTRIC 26800 ESTAMPADO G/L",
      "CD_TIPOCLAS": "201",
      "DS_CLASSIFICACAO": "TECIDO",
      "mp_list": [
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "1.735"
        },
        {
          "CD_PRODUTO_MP": "1011300",
          "DS_PRODUTO_MP": "NEW VELUDO MOLHADO OFFWHITE U",
          "QT_CONSUMOUNIT": "23"
        }
      ]
    }
  ]



  loadingError = false;
  isEmptyList = false;

  constructor(
    private _location: Location
  ) { }

  ngOnInit(): void {
  }

  voltar() {
    this._location.back();
  }

}
