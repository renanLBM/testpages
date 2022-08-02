import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'fc-pendencia',
  templateUrl: './pendencia.component.html',
  styleUrls: ['./pendencia.component.scss'],
})
export class PendenciaComponent implements OnInit {
  test_data = [
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67127',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM P/S',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'AVIAMENTO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000388',
          DS_PRODUTO_MP:
            'ETIQUETA LABELLAMAFIA LATERAL 2015 (26X35) VERMELHO ESCURO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1005554',
          DS_PRODUTO_MP: 'ETIQUETA COMPOSICAO EXPORTACAO BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1006746',
          DS_PRODUTO_MP: 'ETIQUETA MANEQUIM LA MAFIA PRETO P',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1007895',
          DS_PRODUTO_MP: 'BOTAO BOTAO LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '7',
        },
        {
          CD_PRODUTO_MP: '1007898',
          DS_PRODUTO_MP: 'REBITE 13984 LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '2',
        },
        {
          CD_PRODUTO_MP: '1010152',
          DS_PRODUTO_MP: 'ETIQUETA LABELLAMAFIA VHRKP.1 CINZA CLARO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1010611',
          DS_PRODUTO_MP: 'ETIQUETA EMBORRACHADA 4,5X6,5 CM LABELLA BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1011172',
          DS_PRODUTO_MP:
            'ELASTICO 040 MM CL LABELLAMAFIA AIN FIERY VERMELHO/BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67127',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM P/S',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'EMBALAGEM',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000051',
          DS_PRODUTO_MP: 'ETIQUETA TAG COUCHE CARTAO BRANCO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1000369',
          DS_PRODUTO_MP: 'TAG PINO FIX-PIN 80MM NEUTRO . U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1002648',
          DS_PRODUTO_MP: 'SACO PLASTICO 35X45+X0,07 NAO SE APLICA .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1004380',
          DS_PRODUTO_MP: 'TAG 5X20 CINZA/AMARELO .',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67127',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM P/S',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'TECIDO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000336',
          DS_PRODUTO_MP: 'FORRO H130 1,40M CRU .',
          QT_CONSUMOUNIT: '0.07',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67128',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM M/M',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'AVIAMENTO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000388',
          DS_PRODUTO_MP:
            'ETIQUETA LABELLAMAFIA LATERAL 2015 (26X35) VERMELHO ESCURO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1005554',
          DS_PRODUTO_MP: 'ETIQUETA COMPOSICAO EXPORTACAO BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1006747',
          DS_PRODUTO_MP: 'ETIQUETA MANEQUIM LA MAFIA PRETO M',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1007895',
          DS_PRODUTO_MP: 'BOTAO BOTAO LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '7',
        },
        {
          CD_PRODUTO_MP: '1007898',
          DS_PRODUTO_MP: 'REBITE 13984 LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '2',
        },
        {
          CD_PRODUTO_MP: '1010152',
          DS_PRODUTO_MP: 'ETIQUETA LABELLAMAFIA VHRKP.1 CINZA CLARO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1010611',
          DS_PRODUTO_MP: 'ETIQUETA EMBORRACHADA 4,5X6,5 CM LABELLA BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1011172',
          DS_PRODUTO_MP:
            'ELASTICO 040 MM CL LABELLAMAFIA AIN FIERY VERMELHO/BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67128',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM M/M',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'EMBALAGEM',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000051',
          DS_PRODUTO_MP: 'ETIQUETA TAG COUCHE CARTAO BRANCO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1000369',
          DS_PRODUTO_MP: 'TAG PINO FIX-PIN 80MM NEUTRO . U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1002648',
          DS_PRODUTO_MP: 'SACO PLASTICO 35X45+X0,07 NAO SE APLICA .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1004380',
          DS_PRODUTO_MP: 'TAG 5X20 CINZA/AMARELO .',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67128',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM M/M',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'TECIDO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000336',
          DS_PRODUTO_MP: 'FORRO H130 1,40M CRU .',
          QT_CONSUMOUNIT: '0.07',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67129',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM G/L',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'AVIAMENTO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000388',
          DS_PRODUTO_MP:
            'ETIQUETA LABELLAMAFIA LATERAL 2015 (26X35) VERMELHO ESCURO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1005554',
          DS_PRODUTO_MP: 'ETIQUETA COMPOSICAO EXPORTACAO BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1006748',
          DS_PRODUTO_MP: 'ETIQUETA MANEQUIM LA MAFIA PRETO G',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1007895',
          DS_PRODUTO_MP: 'BOTAO BOTAO LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '7',
        },
        {
          CD_PRODUTO_MP: '1007898',
          DS_PRODUTO_MP: 'REBITE 13984 LABELLAMAFIA ROTATIVO NIQUEL .',
          QT_CONSUMOUNIT: '2',
        },
        {
          CD_PRODUTO_MP: '1010152',
          DS_PRODUTO_MP: 'ETIQUETA LABELLAMAFIA VHRKP.1 CINZA CLARO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1010611',
          DS_PRODUTO_MP: 'ETIQUETA EMBORRACHADA 4,5X6,5 CM LABELLA BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1011172',
          DS_PRODUTO_MP:
            'ELASTICO 040 MM CL LABELLAMAFIA AIN FIERY VERMELHO/BRANCO U',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67129',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM G/L',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'EMBALAGEM',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000051',
          DS_PRODUTO_MP: 'ETIQUETA TAG COUCHE CARTAO BRANCO .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1000369',
          DS_PRODUTO_MP: 'TAG PINO FIX-PIN 80MM NEUTRO . U',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1002648',
          DS_PRODUTO_MP: 'SACO PLASTICO 35X45+X0,07 NAO SE APLICA .',
          QT_CONSUMOUNIT: '1',
        },
        {
          CD_PRODUTO_MP: '1004380',
          DS_PRODUTO_MP: 'TAG 5X20 CINZA/AMARELO .',
          QT_CONSUMOUNIT: '1',
        },
      ],
    },
    {
      NR_CICLO: '1551',
      NR_OP: '576',
      CD_REFERENCIA: '23815',
      CD_PRODUTO: '67129',
      DS_PRODUTO: 'JAQUETA DESTROYED 23815 DENIM G/L',
      CD_TIPOCLAS: '201',
      DS_CLASSIFICACAO: 'TECIDO',
      mp_list: [
        {
          CD_PRODUTO_MP: '1000336',
          DS_PRODUTO_MP: 'FORRO H130 1,40M CRU .',
          QT_CONSUMOUNIT: '0.07',
        },
      ],
    },
  ];

  loadingError = false;
  isEmptyList = false;

  constructor(private _location: Location) {}

  ngOnInit(): void {}

  voltar() {
    this._location.back();
  }
}
