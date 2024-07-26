import { atom } from 'recoil'
import defautPicture from '@/public/game/tables/default-table.png'

export const tablePicture = atom({
	key: 'tablePicture',
	default: defautPicture.src,
});
