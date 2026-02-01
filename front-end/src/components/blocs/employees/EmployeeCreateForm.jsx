import React from 'react';
import Input from '../../ui/input';
import Button from '../../ui/button';
import ScrollArea from '../../ui/scroll-area';

const EmployeeCreateForm = () => {
  return (
    <>
      <section className='w-full h-full flex p-4 gap-4'>
        <ScrollArea className={"h-[820px] flex-1 border-none pr-4 pb-2"}>
                <h3 className="sticky top-0 bg-white px-1 py-1 text-lg text-indigo-600 font-semibold">Ajouter un nouvel employé</h3>
            <form action="" className="w-full flex flex-col gap-1 ">
                <div className="rounded-lg p-2">
                    <h4 className="py-2 text-indigo-400 font-medium border-b">Informations personnelles</h4>
                    <div className="grid grid-cols-2 gap-6 py-5">
                        <Input placeholder="Prénom de l'employé" label="Prénom"/>
                        <Input placeholder="Nom de famille" label="Post-nom"/>
                        <Input placeholder="Nom de l'employé" label="Nom"/>
                        <Input placeholder="Nom de l'employé" label="Date de naissance" type="date"/>
                        <Input placeholder="Nom de l'employé" label="Date de naissance" type="date"/>
                        <Input placeholder="Nombre d'enfant" label="Enfant(s)" type="number"/>
                        <Input placeholder="Adresse domicile" label="Adresse" type="text"/>
                        <Input placeholder="Adresse email" label="email" type="email"/>
                        <select className='py-2 border outline-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-200'>
                            <option value="">Choisir le genre</option>
                            <option value="Homme">Homme</option>
                            <option value="Femme">Femme</option>
                        </select>
                        <select className='py-2 border outline-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-200'>
                            <option value="">Choisir l'Etat-civil</option>
                            <option value="Celibataire">Célibataire</option>
                            <option value="Marié">Marié(e)</option>
                        </select>
                    </div>
                </div>
                <div className="rounded-lg p-2">
                    <h4 className="py-2 text-indigo-400 font-medium border-b">Contrat</h4>
                    <div className="grid grid-cols-2 gap-6 py-5">
                        <Input placeholder="Date de début de contrat" label="Date début de contrat" type="date"/>
                        <Input placeholder="Date de fin de contrat" label="Date fin de contrat" type="date"/>
                        <Input placeholder="Poste occupé dans l'entreprise" label="Poste" type="text"/>
                        <Input placeholder="Département" label="Département" type="text"/>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs">Salaire de base</p>
                            <div className="w-full flex items-center justify-between gap-1">
                                <Input placeholder="Salaire de base" type="number" className=""/>
                                <select name="" id="" className='py-2 border outline-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-200'>
                                    <option>USD</option>
                                    <option>CDF</option>
                                </select>
                            </div>
                        </div>
                        <Input placeholder="post occupé dans l'entreprise" label="Poste" type="text"/>
                        <select className='py-2 border outline-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-200'>
                            <option value="">Choisir le type de contrat</option>
                            <option value="cdi">CDI</option>
                            <option value="cdd">CDD</option>
                            <option value="stage">Stage</option>
                            <option value="prestation">Préstation</option>
                            <option value="autres">Autres</option>
                        </select>
                        <select className='py-2 border outline-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-200'>
                            <option value="">Choisir Entreprise d'affectation</option>
                            <option value="cdi">CDI</option>
                            <option value="cdd">CDD</option>
                            <option value="stage">Stage</option>
                            <option value="prestation">Préstation</option>
                            <option value="autres">Autres</option>
                        </select>
                    </div>
                </div>
                <Button buttonStyle={true} className={"py-2 rounded-lg"}>Créer l'employé</Button>
            </form>
        </ScrollArea>
        <aside className=" w-1/3 h-full border">
        </aside>
      </section>
    </>
  );
}

export default EmployeeCreateForm;
