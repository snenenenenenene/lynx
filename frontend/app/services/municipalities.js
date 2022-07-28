import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { municipality_data } from '../data/municipality-data';
import { tax_data } from '../data/tax-data';
import { action } from '@ember/object';
import { addTaxData, addDecisionData } from '../data/municipality-data';
import { revenuePerCategory } from '../helpers/apiInterface';
export default class MunicipalitiesService extends Service {
  @service store;

  @tracked data = municipality_data;
  @tracked tax_cat = tax_data;
  @tracked currentMunicipalityRoute = 'Brugge';
  @action setCurrentMunicipalityRoute(municipality) {
    this.currentMunicipalityRoute = municipality;
  }

  @tracked modalData = municipality_data[0];
  @tracked showModal = false;
  @tracked showMap = true;
  @tracked query = '';

  @action currentSelectedMunicipality(mun) {
    return this.data.find(
      (municipality) => municipality.title.toUpperCase() === mun.toUpperCase()
    );
  }

  @action toggleModal(data) {
    try {
      this.modalData = this.currentSelectedMunicipality(
        data.target.feature.properties.ADMUNADU
      );

      console.log(this.modalData);

      this.revenuePerCategoryData = revenuePerCategory(
        this.modalData.title
      ).then(async (resp) => {
        this.modalGraphData = {
          columns: resp,
          type: 'pie',
        };
        return resp;
      });

      this.showModal = !this.showModal;
    } catch (err) {
      console.log(err);
    }
  }

  @tracked modalGraphData = {
    columns: this.revenuePerCategoryData,
    type: 'pie',
  };

  @tracked revenuePerCategoryData = revenuePerCategory(
    this.municipalities.modalData.title
  ).then(async (resp) => {
    console.log(resp);
    this.modalGraphData = {
      columns: resp,
      type: 'pie',
    };
    return resp;
  });

  @action tableToggleModal(data) {
    this.modalData = this.currentSelectedMunicipality(data.target.innerText);

    this.modalGraphData = {
      type: 'bar',
      columns: this.revenuePerCategoryData,
    };
    this.showModal = !this.showModal;
  }

  @action closeModal() {
    this.showModal = !this.showModal;
  }

  @action toggleView() {
    this.showMap = !this.showMap;
  }

  @action async searchRepo(term) {
    // TODO: fuzzy searching
    // TODO: replace mock tax & decision data with the real thing

    let municipalities = await this.store.query('bestuurseenheid', {
      filter: {
        naam: term,
        classificatie: {
          ':exact:label': 'Gemeente',
        },
      },
    });
    let names = await municipalities.getEach('naam');

    return names.map((name) => {
      return {
        title: name,
        taxData: addTaxData(),
        decisionData: addDecisionData(),
      };
    });
  }
}
