---
title: "Magento : Add pagination to a custom entity listing"
published: true
date: 12/17/2013 11:00pm
taxonomy:
    category: blog
    tag: [magento, pagination]
---

Quick how-to on how you should implement a pagination on your custom entity listing.

===

You have created a new entity type and want to display it as a paginated list ?

First, integrate the Mage\_Page\_Block\_Html\_Pager through your block :

    class Your_Module_Block_Entityname_List extends Mage_Core_Block_Template
    {

      protected function _construct()
      {
          parent::_construct();
        
        // We get our collection through our model
        $this->_entities = Mage::getModel('your_module/entityname')->getCollection()
            ->setOrder('created_at');
            
        // Instantiate a new Pager block
        $pager = new Mage_Page_Block_Html_Pager();


        // We set our limit (here an integer store in configuration). 
        // /!\ The limit must be set before the collection
        $pager
          ->setLimit((int)Mage::getStoreConfig('your_module/entityname/pagination'))
          ->setCollection($this->_entities);
      
        // Add our Pager block to our current list block
        $this->setChild('pager', $pager);
      }
    }

You just need now to include the call in your template (phtml) file :

    <div class="your_module_entities">
      <?php foreach($this->_entities as $entity) : ?>
      
        <div class="entity">
          <h2><?php echo $entity->getAttribute1(); ?></h2>
          <p><?php echo $entity->getAttribute2(); ?></p>
        </div>

      <?php endforeach; ?>
    </div>

    <?php echo $this->getChildHtml('pager'); ?>

  
And you should be good to go !