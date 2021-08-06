import { readdir } from 'fs';
import { join } from 'path';

import { Categories } from '../../../types/index';

const loadCategories = async () => {

  const categories: Categories = {};
  const dataDirPath = join(__dirname, 'data');
  const filenames: string[] = await (
    new Promise(
      (resolve, reject) => {
        readdir(dataDirPath, (err, filenames) => {
          if (err) reject(err);
          resolve(filenames);
        });
      }
    )
  );

  for (const filename of filenames) {

    const [categoryName] = filename.split('.');
    const {
      default: data
    } = await import(`./data/${filename}`);

    if (categoryName) {

      categories[categoryName] = {
        data,
        mutableData: { ...data },
        check(val: string) {
          if (this.mutableData.hasOwnProperty(val)) {
            delete this.mutableData[val];
            return true;
          }
          return false;
        },
        refreshData() {
          this.mutableData = { ...this.data };
        }
      };

    }

  }

  return categories;

};

export { loadCategories };
