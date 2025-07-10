import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterLink, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './servicios.component.html',

  styles: []
})
export class ServiciosComponent {
  servicios = [
    {
      titulo: 'Reparación de Calle',
      ubicacion: 'Calle Principal, Boca del Río',
      fechaCompletado: '15 de Enero, 2024',
      imagenAntes: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpPWhysEbFzRnsXT7Aqg_CjI5IOTL2JB0hJL34A_lfggw0hF8YAFFrU-GCMPJT_p1bDCZS6e3Se6RJpITpAF-RHu-9EM5pPU6fCH-O3M4COz7ebYNh1slP-ktAJlxLAGi-YX9ZE3kP3MHrmEBT_NEehsBuTA2OuM0DfgANQ5AJ_h1MtFwR-UkglYgWTlKVmqG1HE52lc5y7I03Nq71CjVNTmS5h01JijhYhoZwvDCOnJg8k-QqJ8NwrIoUuEukG6QG6Xv9sDc9C0yj',
      imagenDespues: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzsgJflGJZvM9ico0weeHlRw3NzDqm0AupQbbLIXfj7J1k-kJ4E9jQRU5G9AVTLRQ42o-PBslgUxyIO2mRUfp8boL8In53SAzRFulXBCXoKhVG5cvvvBz4ArVF3gb4kATGfSTq_kKMYuLJSYa6Gyss-vvX3gmmfrPz4rjgDqbcXSwnhU6qznxq1lJkSjMLXdQyK79XqN_J5JWKnsXZuISgdRahYAdr-l7LoC189jDVJWzq2rKprvP5X0Vq7JHPiqcuN8DIkMTahgzh'
    },
    {
      titulo: 'Limpieza de Parque',
      ubicacion: 'Parque Central, Boca del Río',
      fechaCompletado: '20 de Febrero, 2024',
      imagenAntes: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGiiIN2mzt6LmSE0INDju2SporHkuv-PfpmyNDhlIrkRXWLvoovZmArjdzHJmE-9GKz1rTInQ7PkjUqCgftComuegfwYhPEtVCGumqPZUsP_k1Ykp6XeiAa5maH9OTvigRXjVuQj2W9xCDKsfsz7jJAspDk_m1q95WMkHIl7x1WSPojVIo_wE6kWScE5qCwmdohBOPn4qLrJYxxiL8j1BiRbMkEQh3c-3WWbNHp8BtWczqSbCuyOfQ7KggzB4FAW3Fuj_8LcBXkxeX',
      imagenDespues: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDcvoCbtyakpQN8ayAf2JlHF60vIUILAYejO7gyimklHPAKzW2PINjiTwY_j9Ko45ken-xisCQQdauA1DWiPbV6FKbNj7fZqK5lMwBS1Er2_OHzT5pYt9Gtv47HSzFgp9N-iS76Hs4Jqq6v-dMvKnH-zxoJDq-ej3alsTnP0rk4r_BiMpvIE39k0W0tSGbo2cQZKqHGRQMcDPOu-wN2pXodS1_Slbse945HIiDwt5iFa-HyLsz0b1Ds6RHk6YsUxHF3mLbNylN-r0a'
    },
    {
      titulo: 'Reparación de Alumbrado',
      ubicacion: 'Avenida de las Palmas, Boca del Río',
      fechaCompletado: '10 de Marzo, 2024',
      imagenAntes: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHxPRIQQcHjAxfrYRvsPHzQfnxDMSEKD-BJwBDgUe6lenyP-1x9ETld7R7ngBmBVNITGlcPS_DBoaJyBPk6BfI-di6U1VP-O03uQbRTdCp4OyGlGz-0K6OS1NBQzFEQMDJZkJiJ2d8D58f4l3mglbfvOGpZwbLUVwNPq8OL8Ya9GSDv6kfOYJkJJ0WwJm35NhV2gfFhbjR08BOPrMnVG13Feb4HJZwhP8mKjbc5g_MplreqGe39meNLpUzmQaBQzIXTWuP0GBEY1z6',
      imagenDespues: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUcyQ0Umneo5a6_FFl7bYxxvjJ99BxkQhs5c6a8m9rFY9W-xNSkueALiihb2AfkCV-CyVieLn_6ILw_eewMioaqGknjXr1b0lJo4TddXq_T5_p25uxv5AXR0Faw47SCSdnkCWR8l6S4jH5sRh2A_1oC7dfXLSPVgz3ovhOHJ5BCnSv665rHeMKMWBYm2_mCfBrI8E1XjuChyNDruvTOpmDmAkj_wFIPT7EcXjvyHDZzK206DMIDV74SO7t1xsEn6kNZUt9PC5xLj-i'
    }
  ];
}